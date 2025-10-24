"use client";

import React from "react";
import { Radio, Settings, AlertTriangle, Scan } from "lucide-react";

interface RfidDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "busy";
  signal: number;
  lastSeen: Date;
}

interface RfidControlCardProps {
  availableDevices: RfidDevice[];
  selectedDevice: string | null;
  rfidConnected: boolean;
  scanning: boolean;
  showDeviceList: boolean;
  onToggleDeviceList: () => void;
  onSelectDevice: (deviceId: string) => void;
  onConnectRfid: () => void;
  onScanRfid: () => void;
}

export default function RfidControlCard({
  availableDevices,
  selectedDevice,
  rfidConnected,
  scanning,
  showDeviceList,
  onToggleDeviceList,
  onSelectDevice,
  onConnectRfid,
  onScanRfid,
}: RfidControlCardProps) {
  const getSelectedDeviceInfo = () => {
    return availableDevices.find((device) => device.id === selectedDevice);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Radio className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Điều khiển thiết bị RFID
              </h3>
              <p className="text-sm text-gray-600 hidden sm:block">
                Quản lý và điều khiển thiết bị quét RFID
              </p>
            </div>
          </div>
          <button
            onClick={onToggleDeviceList}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showDeviceList ? "Ẩn danh sách" : "Quản lý thiết bị"}
            </span>
          </button>
        </div>
      </div>

      {/* Device Management Panel */}
      {showDeviceList && (
        <div className="border-b border-gray-200 bg-gray-50 p-4 md:p-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Danh sách thiết bị
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => onSelectDevice(device.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedDevice === device.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          device.status === "online"
                            ? "bg-green-500"
                            : device.status === "busy"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {device.name}
                      </span>
                    </div>
                    {selectedDevice === device.id && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {device.type} • Tín hiệu: {device.signal}%
                  </div>
                  
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        device.status === "online"
                          ? "bg-green-100 text-green-700"
                          : device.status === "busy"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {device.status === "online"
                        ? "Sẵn sàng"
                        : device.status === "busy"
                        ? "Đang sử dụng"
                        : "Ngoại tuyến"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="p-4 md:p-6">
        {/* Selected Device Info */}
        {selectedDevice && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200 mb-3">
              Thiết bị đã chọn
            </h4>
            
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded p-2">
                  <Radio className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-blue-900 truncate">
                    {getSelectedDeviceInfo()?.name}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {getSelectedDeviceInfo()?.type} • Tín hiệu: {getSelectedDeviceInfo()?.signal}%
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    getSelectedDeviceInfo()?.status === "online"
                      ? "bg-green-100 text-green-700"
                      : getSelectedDeviceInfo()?.status === "busy"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {getSelectedDeviceInfo()?.status === "online"
                    ? "Sẵn sàng"
                    : getSelectedDeviceInfo()?.status === "busy"
                    ? "Đang sử dụng"
                    : "Ngoại tuyến"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Central Action Interface */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Điều khiển quét
          </h4>
          
          <div className="flex flex-col items-center space-y-6">
            {/* Main Control Button */}
            <div className="relative">
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </>
              )}

              <button
                onClick={!rfidConnected ? onConnectRfid : onScanRfid}
                disabled={!selectedDevice}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  !selectedDevice
                    ? "bg-gray-400 cursor-not-allowed"
                    : !rfidConnected
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-lg hover:shadow-xl"
                    : scanning
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg animate-pulse"
                    : "bg-green-600 hover:bg-green-700 focus:ring-green-300 shadow-lg hover:shadow-xl"
                }`}
              >
                {!selectedDevice ? (
                  <AlertTriangle className="h-6 w-6 md:h-8 md:w-8" />
                ) : !rfidConnected ? (
                  <div className="flex flex-col items-center">
                    <Radio className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                    <span className="text-xs">Kết nối</span>
                  </div>
                ) : scanning ? (
                  <div className="flex flex-col items-center">
                    <Scan className="h-5 w-5 md:h-6 md:w-6 mb-1 animate-spin" />
                    <span className="text-xs">Dừng</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Scan className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                    <span className="text-xs">Quét</span>
                  </div>
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <div className="font-medium text-gray-900 text-sm md:text-base">
                {!selectedDevice
                  ? "Chưa chọn thiết bị"
                  : !rfidConnected
                  ? "Nhấn để kết nối Bluetooth"
                  : scanning
                  ? "Đang quét RFID..."
                  : "Sẵn sàng quét"}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">
                {!selectedDevice
                  ? "Vui lòng chọn thiết bị từ danh sách"
                  : !rfidConnected
                  ? `Kết nối với ${getSelectedDeviceInfo()?.name}`
                  : scanning
                  ? "Nhấn để dừng quét"
                  : "Nhấn để bắt đầu quét tài sản"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
