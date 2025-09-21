import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AssetBook, AssetBookItem, AssetBookStatus, AssetType, BookStatus } from "@/types/asset";
import { axiosInstance } from "@/lib/api";

interface AssetBookInventory extends AssetBook {
  assetTypes: [
    {
      type: AssetType;
      items: AssetBookItem[];
    }
  ];
}
interface AssetState {
  assetBookInventory: AssetBookInventory;
}

const initialState: AssetState = {
  assetBookInventory: {
    assetTypes: [
      {
        type: AssetType.FIXED_ASSET,
        items: [],
      },
    ],
    id: "",
    unitId: "",
    year: 0,
    status: AssetBookStatus.OPEN,
  },
};

export const getAssetBookInventoryFromUnitIdAndRoomId = createAsyncThunk(
  "assetBook/getAssetBookInventoryFromUnitIdAndRoomId",
  async (params: { unitId: string; roomId: string }) => {
    const response = await axiosInstance.get(
      `/api/v1/asset-books/unit/${params.unitId}/room/${params.roomId}`
    );
    return response.data;
  }
);

const assetBookSlice = createSlice({
  name: "assetBook",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAssetBookInventoryFromUnitIdAndRoomId.fulfilled,
      (state, action) => {
        state.assetBookInventory = action.payload;
      }
    );

    builder.addCase(
      getAssetBookInventoryFromUnitIdAndRoomId.rejected,
      (state, action) => {}
    );

    builder.addCase(
      getAssetBookInventoryFromUnitIdAndRoomId.pending,
      (state, action) => {}
    );
  },
});

export const {} = assetBookSlice.actions;

export default assetBookSlice.reducer;
