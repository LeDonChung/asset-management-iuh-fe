"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Package2,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetStatus, RoomStatus } from '@/types/asset';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// Mock asset data
const mockAsset: Asset = {
  id: "1",
  ktCode: "24-0001/01",
  fixedCode: "4001.00001",
  name: "Máy tính Dell Latitude 5520",
  specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD",
  entryDate: "2024-01-15",
  plannedRoomId: "1",
  unit: "Cái",
  quantity: 1,
  origin: "Dell Việt Nam",
  purchasePackage: 1,
  type: "TSCD" as any,
  isLocked: false,
  categoryId: "4",
  status: AssetStatus.CHO_PHAN_BO,
  createdBy: "user1",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  category: { id: "4", name: "Máy tính", code: "4" },
  room: { id: "1", building: "B", floor: "1", roomNumber: "Phòng IT 09", status: RoomStatus.ACTIVE, unitId: "unit1" },
  rfidTag: undefined // No RFID tag assigned yet
};

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function AssetRFIDPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scannedRfidId, setScannedRfidId] = useState<string>('');
  const [manualRfidId, setManualRfidId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Mock API call to fetch asset
    const fetchAsset = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAsset(mockAsset);
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [params.id]);

  const simulateRFIDScan = () => {
    setScanStatus('scanning');
    setErrorMessage('');
    
    // Simulate scanning process
    setTimeout(() => {
      // Mock success - generate a random RFID ID
      const mockRfidId = "E280F3362000F" + Math.random().toString(36).substr(2, 12).toUpperCase();
      setScannedRfidId(mockRfidId);
      setScanStatus('success');
    }, 2000);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualRfidId(e.target.value.toUpperCase());
    setScanStatus('idle');
    setErrorMessage('');
  };

  const validateRfidId = (rfidId: string): boolean => {
    // Basic validation - RFID ID should be hexadecimal and 24 characters long
    const rfidPattern = /^[0-9A-F]{24}$/;
    return rfidPattern.test(rfidId);
  };

  const handleAssignRFID = async () => {
    if (!asset) return;

    const rfidId = scannedRfidId || manualRfidId;
    
    if (!rfidId) {
      setErrorMessage('Vui lòng quét hoặc nhập mã RFID');
      return;
    }

    if (!validateRfidId(rfidId)) {
      setErrorMessage('Mã RFID không hợp lệ. Vui lòng kiểm tra lại.');
      setScanStatus('error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mock API call to assign RFID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update asset with RFID tag
      const updatedAsset = {
        ...asset,
        rfidTag: {
          rfidId,
          assetId: asset.id,
          assignedDate: new Date().toISOString()
        }
      };
      
      setAsset(updatedAsset);
      setScanStatus('success');
      
      // Show success message and redirect after delay
      setTimeout(() => {
        router.push(`/asset/${asset.id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error assigning RFID:", error);
      setErrorMessage('Có lỗi xảy ra khi gán RFID. Vui lòng thử lại.');
      setScanStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanStatus('idle');
    setScannedRfidId('');
    setManualRfidId('');
    setErrorMessage('');
  };

  if (isLoading && !asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        {/* Skeleton for Asset Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        
        {/* Skeleton for RFID Scanner */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="p-6 space-y-6">
            <div className="text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-10 w-40 mx-auto mt-4" />
            </div>
            
            <div className="border-t pt-6">
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="flex space-x-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <Package2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy tài sản</h3>
        <p className="mt-1 text-sm text-gray-500">Tài sản không tồn tại hoặc đã bị xóa.</p>
        <div className="mt-6">
          <Link href="/asset">
            <Button className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/asset/${asset.id}`}>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quét RFID</h1>
          <p className="text-gray-600">Gán thẻ RFID cho tài sản</p>
        </div>
      </div>

      {/* Asset Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900">{asset.name}</h3>
            <div className="mt-1 text-sm text-gray-500">
              <div>Mã kế toán: <span className="font-mono">{asset.ktCode}</span></div>
              <div>Mã tài sản: <span className="font-mono">{asset.fixedCode}</span></div>
            </div>
          </div>
          {asset.rfidTag && (
            <div className="flex-shrink-0">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                ✓ Đã có RFID
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Current RFID Status */}
      {asset.rfidTag && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-green-900">RFID đã được gán</h4>
              <p className="text-sm text-green-700">
                Mã RFID: <span className="font-mono font-medium">{asset.rfidTag.rfidId}</span>
              </p>
              <p className="text-xs text-green-600">
                Ngày gán: {new Date(asset.rfidTag.assignedDate).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RFID Scanner */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {asset.rfidTag ? "Cập nhật RFID" : "Gán RFID mới"}
          </h3>
          <p className="text-sm text-gray-500">
            Quét thẻ RFID hoặc nhập mã thủ công
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner Section */}
          <div className="text-center">
            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              scanStatus === 'scanning' ? 'bg-blue-100 animate-pulse' :
              scanStatus === 'success' ? 'bg-green-100' :
              scanStatus === 'error' ? 'bg-red-100' :
              'bg-gray-100 hover:bg-gray-200 cursor-pointer'
            }`} onClick={scanStatus === 'idle' ? simulateRFIDScan : undefined}>
              {scanStatus === 'scanning' && (
                <div className="animate-spin">
                  <Scan className="h-12 w-12 text-blue-600" />
                </div>
              )}
              {scanStatus === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {scanStatus === 'error' && (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              {scanStatus === 'idle' && (
                <Scan className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div className="mt-4">
              {scanStatus === 'idle' && (
                <Button
                  onClick={simulateRFIDScan}
                  size="lg"
                >
                  Bắt đầu quét RFID
                </Button>
              )}
              {scanStatus === 'scanning' && (
                <p className="text-blue-600 font-medium">Đang quét RFID...</p>
              )}
              {scanStatus === 'success' && scannedRfidId && (
                <div>
                  <p className="text-green-600 font-medium">Quét thành công!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Mã RFID: <span className="font-mono">{scannedRfidId}</span>
                  </p>
                </div>
              )}
              {scanStatus === 'error' && (
                <p className="text-red-600 font-medium">Quét thất bại</p>
              )}
            </div>
          </div>

          {/* Manual Input */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập mã RFID thủ công
            </label>
            <div className="flex space-x-3">
              <Input
                type="text"
                value={manualRfidId}
                onChange={handleManualInput}
                placeholder="E280F3362000F00005E66021"
                maxLength={24}
                className="flex-1 font-mono"
              />
              <Button 
                onClick={handleReset}
                variant="ghost"
                size="icon"
                title="Làm mới"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Mã RFID phải có 24 ký tự (0-9, A-F)
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link href={`/asset/${asset.id}`}>
              <Button variant="outline">
                Hủy
              </Button>
            </Link>
            <Button
              onClick={handleAssignRFID}
              disabled={(!scannedRfidId && !manualRfidId) || isLoading || scanStatus === 'scanning'}
              className="flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {asset.rfidTag ? "Cập nhật RFID" : "Gán RFID"}
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Nhấn "Bắt đầu quét RFID" và đặt thẻ RFID gần máy quét</li>
          <li>• Hoặc nhập mã RFID thủ công vào ô bên dưới</li>
          <li>• Mã RFID phải là duy nhất và chưa được sử dụng cho tài sản khác</li>
          <li>• Sau khi gán thành công, bạn sẽ được chuyển về trang chi tiết tài sản</li>
        </ul>
      </div>
    </div>
  );
}
