"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { RoomStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdjacentRoomSelector from "@/components/room/AdjacentRoomSelector";
import {
  updateRoom,
  fetchRoomById,
  fetchRoomSuggestions,
  clearError,
} from "@/lib/store/slices/roomSlice";
import { getAllUnits } from "@/lib/store/slices/unitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";

interface RoomFormData {
  name: string;
  building: string;
  floor: string;
  roomNumber: string;
  unitId: string;
  status: RoomStatus;
  adjacentRooms: string[];
}

interface FormErrors {
  name?: string;
  building?: string;
  floor?: string;
  roomNumber?: string;
  unitId?: string;
}

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.id as string;
  const roomId = params.roomId as string;
  const dispatch = useAppDispatch();

  // Redux state
  const {
    currentRoom,
    loading,
    updateLoading,
    updateError,
    suggestions,
    suggestionsLoading,
  } = useAppSelector((state: RootState) => state.room);

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    building: "",
    floor: "",
    roomNumber: "",
    unitId: unitId || "",
    status: RoomStatus.ACTIVE,
    adjacentRooms: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedAdjacentRooms, setSelectedAdjacentRooms] = useState<string[]>(
    []
  );

  // Fetch room data when component mounts
  useEffect(() => {
    if (roomId) {
      dispatch(fetchRoomById(roomId));
    }
  }, [roomId, dispatch]);

  // Update form data when room is loaded
  useEffect(() => {
    if (currentRoom) {
      setFormData({
        name: currentRoom.name || "",
        building: currentRoom.building || "",
        floor: currentRoom.floor || "",
        roomNumber: currentRoom.roomNumber || currentRoom.name || "",
        unitId: currentRoom.unitId || "",
        status: currentRoom.status,
        adjacentRooms: currentRoom.adjacentRooms
          ? currentRoom.adjacentRooms.map((r) => r.id)
          : [],
      });
      setSelectedAdjacentRooms(
        currentRoom.adjacentRooms
          ? currentRoom.adjacentRooms.map((r) => r.id)
          : []
      );
    }
  }, [currentRoom]);

  // Fetch room suggestions when building or floor changes
  useEffect(() => {
    if (formData.building || formData.floor) {
      dispatch(
        fetchRoomSuggestions({
          building: formData.building || undefined,
          floor: formData.floor || undefined,
          excludeUnitId: unitId || undefined,
        })
      );
    }
  }, [formData.building, formData.floor, unitId, dispatch]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      console.error("Update room error:", updateError);
      // toast.error(updateError); // TODO: Add toast notification
      dispatch(clearError());
    }
  }, [updateError, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên phòng là bắt buộc";
    if (!formData.building.trim()) newErrors.building = "Tòa nhà là bắt buộc";
    if (!formData.floor.trim()) newErrors.floor = "Tầng là bắt buộc";
    if (!formData.roomNumber.trim())
      newErrors.roomNumber = "Số phòng là bắt buộc";
    if (!formData.unitId) newErrors.unitId = "Đơn vị là bắt buộc";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && currentRoom) {
      try {
        const roomData = {
          id: currentRoom.id,
          name: formData.name,
          building: formData.building,
          floor: formData.floor,
          roomNumber: formData.roomNumber,
          unitId: formData.unitId,
          status: formData.status,
          adjacentRoomIds: selectedAdjacentRooms,
        };

        const result = await dispatch(updateRoom(roomData));

        if (updateRoom.fulfilled.match(result)) {
          console.log("Room updated successfully!");
          // toast.success("Cập nhật phòng thành công!"); // TODO: Add toast notification
          router.push(`/unit/${unitId}/room`);
        }
      } catch (error) {
        console.error("Error updating room:", error);
      }
    }
  };

  const handleChange = (
    field: keyof RoomFormData,
    value: string | RoomStatus | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleAdjacentRoom = (roomId: string) => {
    setSelectedAdjacentRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleRemoveAdjacentRoom = (roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      adjacentRooms: prev.adjacentRooms.filter((id) => id !== roomId),
    }));
    setSelectedAdjacentRooms((prev) => prev.filter((id) => id !== roomId));
  };

  // Lấy danh sách phòng gợi ý từ API
  const getAvailableAdjacentRooms = () => {
    return suggestions.filter((room) => room.id !== currentRoom?.id);
  };

  // Show loading state while fetching room data
  if (loading && !currentRoom) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải thông tin phòng...</div>
        </div>
      </div>
    );
  }

  // Show error if room not found
  if (!loading && !currentRoom && roomId) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Không tìm thấy thông tin phòng</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/unit/${unitId}/room`}>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cập nhật phòng</h1>
          <p className="text-gray-600">
            Chỉnh sửa thông tin: {currentRoom?.roomNumber || currentRoom?.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto rounded-lg border border-gray-300">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Information */}
            <div>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phòng *
                  </label>
                  <Input
                    type="text"
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Nhập tên phòng (VD: Phòng IT 09, Phòng Họp A1)"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Building */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tòa nhà *
                    </label>
                    <Input
                      type="text"
                      className={errors.building ? "border-red-500" : ""}
                      placeholder="VD: A, B, C"
                      value={formData.building}
                      onChange={(e) => handleChange("building", e.target.value)}
                    />
                    {errors.building && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.building}
                      </p>
                    )}
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tầng *
                    </label>
                    <Input
                      type="text"
                      className={errors.floor ? "border-red-500" : ""}
                      placeholder="VD: 1, 2, 3"
                      value={formData.floor}
                      onChange={(e) => handleChange("floor", e.target.value)}
                    />
                    {errors.floor && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.floor}
                      </p>
                    )}
                  </div>

                  {/* Room Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số phòng *
                    </label>
                    <Input
                      type="text"
                      className={errors.roomNumber ? "border-red-500" : ""}
                      placeholder="VD: 101, B09"
                      value={formData.roomNumber}
                      onChange={(e) =>
                        handleChange("roomNumber", e.target.value)
                      }
                    />
                    {errors.roomNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.roomNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    value={formData.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value as RoomStatus)
                    }
                  >
                    <option value={RoomStatus.ACTIVE}>Đang hoạt động</option>
                    <option value={RoomStatus.INACTIVE}>Ngừng hoạt động</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Adjacent Rooms Selection */}
            <div>
              <div className=" rounded-lg">
                <AdjacentRoomSelector
                  availableRooms={getAvailableAdjacentRooms()}
                  selectedRoomIds={selectedAdjacentRooms}
                  onToggleRoom={handleToggleAdjacentRoom}
                  onRemoveRoom={handleRemoveAdjacentRoom}
                />

                {suggestionsLoading ? (
                  <p className="text-xs text-blue-600 mt-2">
                    Đang tải gợi ý phòng...
                  </p>
                ) : formData.building || formData.floor ? (
                  <p className="text-xs text-gray-600 mt-2">
                    {suggestions.length > 0
                      ? `Hiển thị ${suggestions.length} phòng gợi ý cùng tòa "${formData.building}" hoặc cùng tầng "${formData.floor}"`
                      : `Không tìm thấy phòng nào cùng tòa "${formData.building}" hoặc cùng tầng "${formData.floor}"`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    Nhập thông tin tòa nhà và tầng để xem các phòng có thể chọn
                    làm hàng xóm
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              
              <Link href={`/unit/${unitId}/room`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={updateLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateLoading ? "Đang cập nhật..." : "Cập nhật phòng"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
