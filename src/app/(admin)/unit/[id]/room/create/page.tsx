"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, MapPin, Building, Users, Link2 } from "lucide-react";
import Link from "next/link";
import { RoomStatus, Unit, UnitStatus, Room } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdjacentRoomSelector from "@/components/room/AdjacentRoomSelector";
import {
  createRoom,
  fetchRoomSuggestions,
  clearError,
} from "@/lib/store/slices/roomSlice";
import { getAllUnits } from "@/lib/store/slices/unitSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
// import { toast } from "sonner"; // TODO: Add sonner package or use alternative

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

export default function CreateRoomPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params?.id as string;
  const dispatch = useAppDispatch();

  // Redux state
  const { createLoading, createError, suggestions, suggestionsLoading } =
    useAppSelector((state: RootState) => state.room);

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
  }, [formData.building, formData.floor, formData.unitId, dispatch]);

  // Handle create error
  useEffect(() => {
    if (createError) {
      console.error("Create room error:", createError);
      // toast.error(createError); // TODO: Add toast notification
      dispatch(clearError());
    }
  }, [createError, dispatch]);

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

    if (Object.keys(newErrors).length === 0) {
      try {
        const roomData = {
          name: formData.name,
          building: formData.building,
          floor: formData.floor,
          roomNumber: formData.roomNumber,
          unitId: formData.unitId,
          status: formData.status,
          adjacentRoomIds: formData.adjacentRooms,
        };

        const result = await dispatch(createRoom(roomData));

        if (createRoom.fulfilled.match(result)) {
          console.log("Room created successfully!");
          // toast.success("Tạo phòng thành công!"); // TODO: Add toast notification
          router.push(`/unit/${unitId}/room`);
        }
      } catch (error) {
        console.error("Error creating room:", error);
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
    setFormData((prev) => ({
      ...prev,
      adjacentRooms: prev.adjacentRooms.includes(roomId)
        ? prev.adjacentRooms.filter((id) => id !== roomId)
        : [...prev.adjacentRooms, roomId],
    }));
  };

  const handleRemoveAdjacentRoom = (roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      adjacentRooms: prev.adjacentRooms.filter((id) => id !== roomId),
    }));
  };

  // Lấy danh sách phòng gợi ý từ API
  const getAvailableAdjacentRooms = () => {
    return suggestions;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/unit/${unitId}/room`}>
          <Button variant="ghost" size="sm" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm phòng mới</h1>
          <p className="text-gray-600">
            Nhập thông tin phòng và chọn các phòng cạnh bên
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
              <div className="p-4 rounded-lg">
                <AdjacentRoomSelector 
                  availableRooms={getAvailableAdjacentRooms()}
                  selectedRoomIds={formData.adjacentRooms}
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
              <Button
                type="submit"
                disabled={createLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {createLoading ? "Đang lưu..." : "Lưu phòng"}
              </Button>
              <Link href={`/unit/${unitId}/room`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  Hủy bỏ
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
