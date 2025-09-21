import axiosInstance from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface FileState {
  files: any[];
  loading: boolean;
  error: string | null;
  inventoryImages: any[]; // Store uploaded images for inventory
}

const initialState: FileState = {
  files: [],
  loading: false,
  error: null,
  inventoryImages: [], // Store uploaded images for inventory
};

export const uploadFileDocument = createAsyncThunk(
  "files/upload/document",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      console.log('Uploading file:', file);
      console.log('FormData entries:', Array.from(formData.entries()));
      
      const response = await axiosInstance.post(
        "/api/v1/files/upload/document",
        formData,
        {
          headers: {
            ...axiosInstance.defaults.headers.common,
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: [function (data, headers) {
            delete headers['Content-Type'];
            return data;
          }],
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadInventoryImage = createAsyncThunk(
  "files/upload/inventory-image",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      console.log('Uploading inventory image:', file);
      
      const response = await axiosInstance.post(
        "/api/v1/files/upload/image",
        formData,
        {
          headers: {
            ...axiosInstance.defaults.headers.common,
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: [function (data, headers) {
            delete headers['Content-Type'];
            return data;
          }],
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Upload inventory image error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    addInventoryImage: (state, action) => {
      state.inventoryImages.push(action.payload);
    },
    removeInventoryImage: (state, action) => {
      state.inventoryImages = state.inventoryImages.filter(
        (img, index) => index !== action.payload
      );
    },
    clearInventoryImages: (state) => {
      state.inventoryImages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFileDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFileDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(uploadFileDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any).message;
      })
      .addCase(uploadInventoryImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadInventoryImage.fulfilled, (state, action) => {
        state.loading = false;
        // Check if image already exists to avoid duplicates
        const existingImage = state.inventoryImages.find((img: any) => img.url === action.payload.url);
        if (!existingImage) {
          state.inventoryImages.push(action.payload);
        }
      })
      .addCase(uploadInventoryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any).message;
      });
  },
});

export const { addInventoryImage, removeInventoryImage, clearInventoryImages } = fileSlice.actions;

export default fileSlice.reducer;
