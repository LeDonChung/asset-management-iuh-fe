import axiosInstance from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
  loading: false,
  error: null,
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

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {},
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
      });
  },
});

export default fileSlice.reducer;
