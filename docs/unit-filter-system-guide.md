Controller

@Post("filter")
  @ApiOperation({
    summary: "Lấy danh sách tất cả kỳ kiểm kê với bộ lọc và phân trang",
  })
  @ApiResponse({
    status: 200,
    description: "Danh sách kỳ kiểm kê với phân trang",
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 500, description: "Lỗi server" })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  async filter(
    @Body() filterDto: UnitFilterDto
  ): Promise<PaginatedResponseDto<UnitResponseDto>> {
    return this.unitsService.findAllWithFilter(filterDto);
  }



Dto
export class UnitFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Quick filter by status",
    enum: UnitStatus,
  })
  @IsOptional()
  statusFilter?: UnitStatus;

  @ApiPropertyOptional({
    description: "Quick filter by unit type",
    enum: UnitType,
  })
  @IsOptional()
  unitTypeFilter?: UnitType;
}

Service 
async findAllWithFilter(
    filterDto: UnitFilterDto
  ): Promise<PaginatedResponseDto<UnitResponseDto>> {
    try {
      const config = {
        searchFields: ["name"],
        fieldTypeMap: {
          name: FieldType.TEXT,
        },
        defaultSorting: { field: "createdAt", direction: "DESC" as const },
        relations: [],
      };

      // Handle quick filters for backward compatibility
      if (filterDto.statusFilter || filterDto.unitTypeFilter) {
        // Add quick filter conditions to the existing conditions
        const quickFilterConditions = [];

        if (filterDto.unitTypeFilter) {
          quickFilterConditions.push({
            field: "type",
            fieldType: "select",
            operator: "equals",
            value: filterDto.unitTypeFilter,
          });
        }

        if (filterDto.statusFilter) {
          quickFilterConditions.push({
            field: "status",
            fieldType: "select",
            operator: "equals",
            value: filterDto.statusFilter,
          });
        }

        // Merge with existing conditions
        filterDto.conditions = [
          ...(filterDto.conditions || []),
          ...quickFilterConditions,
        ];
      }

      return FilterUtil.getFilteredResults(
        this.unitRepository,
        filterDto,
        UnitResponseDto,
        config,
        "unit"
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

Slice 

export interface UnitFilterRequest extends BaseFilterRequest {
  search?: string;
  statusFilter?: UnitStatus;
  unitTypeFilter?: UnitType;
}
interface UnitState {
  filteredUnits: PaginatedResponse<Unit>;
  currentFilter: UnitFilterRequest;
}

const initialState: UnitState = {
  filteredUnits: {
    data: [],
    pagination: {
      page: 2,
      limit: 10,
    },
  },
  currentFilter: {
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  },
  
};
export const filterUnit = createAsyncThunk(
  "units/filter",
  async (filterRequest: UnitFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/units/filter",
        filterRequest
      );
      return response.data as PaginatedResponse<Unit>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

.addCase(filterUnit.pending, (state) => {})
      .addCase(filterUnit.fulfilled, (state, action) => {
        state.filteredUnits = action.payload;
        // Cập nhật currentFilter từ request được gửi đi
        state.currentFilter = {
          ...state.currentFilter,
          ...action.meta.arg, // action.meta.arg chứa filterRequest đã gửi
        };
        if (state.currentFilter.pagination && action.payload.pagination) {
          state.currentFilter.pagination = {
            ...state.currentFilter.pagination,
            currentPage: action.payload.pagination.page,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit,
          };
        }
      })
      .addCase(filterUnit.rejected, (state, action) => {
        console.log(action.payload as any);
      });


View


useEffect(() => {
    const loadData = () => {
      try {
        dispatch(filterUnit(currentFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: searchTerm || undefined,
      unitTypeFilter: typeFilter || undefined,
      statusFilter: statusFilter || undefined,
    });
  }, [searchTerm, typeFilter, statusFilter]);

  const handlerRender = (currentFilter: UnitFilterRequest) => {
    dispatch(filterUnit(currentFilter));
  };




{/* Units Table */}
      <Table<Unit>
        columns={columns}
        data={filteredUnits.data}
        emptyText="Không tìm thấy đơn vị"
        emptyIcon={
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        }
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: filteredUnits?.pagination.page || 1,
          pageSize: filteredUnits?.pagination.limit || 5,
          total: filteredUnits?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentFilter,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          serverSide: true,
        }}
      />