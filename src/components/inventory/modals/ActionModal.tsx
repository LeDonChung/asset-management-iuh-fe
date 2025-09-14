import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Asset, InventoryResultStatus } from '@/types/asset';
import { Camera, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  actionType: 'LIQUIDATION' | 'REPAIR' | null;
  onConfirm: (data: ActionModalData) => void;
}

export interface ActionModalData {
  reason: string;
  images: File[];
  status: InventoryResultStatus;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  asset,
  actionType,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason,
        images,
        status: actionType === 'LIQUIDATION' 
          ? InventoryResultStatus.LIQUIDATION_PROPOSED 
          : InventoryResultStatus.NEEDS_REPAIR
      });
      
      // Reset form
      setReason('');
      setImages([]);
      onClose();
    } catch (error) {
      console.error('Error submitting action:', error);
    } finally {
      setLoading(false);
    }
  };

  const title = actionType === 'LIQUIDATION' ? 'Đề xuất thanh lý' : 'Đề xuất sửa chữa';
  const description = actionType === 'LIQUIDATION' 
    ? 'Vui lòng cung cấp lý do và hình ảnh minh chứng cho việc đề xuất thanh lý tài sản này.'
    : 'Vui lòng cung cấp lý do và hình ảnh minh chứng cho việc đề xuất sửa chữa tài sản này.';

  // Don't render if asset is null
  if (!asset || !actionType) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Asset Info */}
          <Alert>
            <AlertDescription>
              <div className="font-medium">Tài sản: {asset.name}</div>
              <div className="text-sm text-gray-600">
                Mã: {asset.ktCode} | Vị trí: {asset.room?.name || 'Chưa có'}
              </div>
            </AlertDescription>
          </Alert>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">
              Lý do {actionType === 'LIQUIDATION' ? 'thanh lý' : 'sửa chữa'} *
            </Label>
            <Textarea
              id="reason"
              placeholder={`Nhập lý do ${actionType === 'LIQUIDATION' ? 'thanh lý' : 'sửa chữa'}...`}
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Hình ảnh minh chứng</Label>
            <div className="mt-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Tải lên hình ảnh
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 10MB mỗi file
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!reason.trim() || loading}
            className={actionType === 'LIQUIDATION' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {loading ? 'Đang xử lý...' : (actionType === 'LIQUIDATION' ? 'Đề xuất thanh lý' : 'Đề xuất sửa chữa')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
