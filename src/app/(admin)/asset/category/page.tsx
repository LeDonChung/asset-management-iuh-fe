"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/lib/store/slices/categorySlice';
import { Category } from '@/types/asset';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { Table, TableColumn } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

// Category Form Modal
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  categories: Category[];
}

function CategoryFormModal({ isOpen, onClose, category, categories }: CategoryFormModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.category);
  
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
      });
    } else {
      setFormData({
        name: '',
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên thể loại');
      return;
    }

    try {
      const submitData: CreateCategoryRequest = {
        name: formData.name.trim(),
      };

      await dispatch(createCategory(submitData)).unwrap();
      toast.success('Tạo thể loại thành công');
      
      onClose();
    } catch (error: any) {
      // Xử lý lỗi duplicate key
      if (error?.message?.includes('duplicate key') || error?.message?.includes('unique constraint')) {
        toast.error('Có lỗi hệ thống khi tạo mã thể loại. Vui lòng thử lại sau ít phút.');
        console.error('Category code generation error:', error);
      } else {
        toast.error(error?.message || 'Có lỗi xảy ra khi tạo thể loại');
      }
    }
  };

  // Filter parent categories (exclude current category and its children)
  const availableParentCategories = categories.filter(cat => {
    if (!category) return true;
    if (cat.id === category.id) return false;
    // Simple check - in a real app you might want to check for circular references more thoroughly
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm thể loại mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Tên thể loại *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên thể loại"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

function DeleteConfirmModal({ isOpen, onClose, category }: DeleteConfirmModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.category);

  const handleDelete = async () => {
    if (!category) return;

    try {
      await dispatch(deleteCategory(category.id)).unwrap();
      toast.success('Xóa thể loại thành công');
      onClose();
    } catch (error: any) {
      toast.error(error || 'Có lỗi xảy ra khi xóa thể loại');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa">
      <div className="space-y-4">
        <p className="text-gray-600">
          Bạn có chắc chắn muốn xóa thể loại <strong>"{category?.name}"</strong> không?
        </p>
        <p className="text-sm text-red-600">
          Lưu ý: Không thể xóa thể loại có thể loại con hoặc đang được sử dụng bởi tài sản.
        </p>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function CategoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.category);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const columns: TableColumn<Category>[] = [
    {
      key: "code",
      title: "Mã thể loại",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">{record.code}</div>
      ),
      sortable: true,
    },
    {
      key: "name",
      title: "Tên thể loại",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">{record.name}</div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, category) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category);
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thể loại</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý danh mục phân loại tài sản
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <span>Thêm thể loại</span>
        </Button>
      </div>

      {/* Table */}
      <Table 
        data={categories} 
        columns={columns} 
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: categories.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showQuickJumper: true,
          showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} thể loại`,
        }}
        rowKey="id"
        emptyText="Không có thể loại nào"
        emptyIcon={
          <div className="h-12 w-12 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xl">📁</span>
          </div>
        }
      />

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        category={selectedCategory}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
}
