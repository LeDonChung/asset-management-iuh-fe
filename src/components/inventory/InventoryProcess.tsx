import { AlertCircle, Building2, FileText } from "lucide-react";

export const InventoryProcess = () => {
  return (
    <div className="mt-6 space-y-6">
      {/* Progress Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Unit Progress */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-gray-600" />
            Tiến độ đơn vị
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Số đơn vị đã kiểm kê
              </span>
              <span className="text-lg font-semibold text-gray-900">
                0 / 12
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">0%</span>
              <p className="text-sm text-gray-500">đơn vị đã hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Asset Progress */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Tiến độ tài sản
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Tổng số tài sản đã kiểm kê
              </span>
              <span className="text-lg font-semibold text-gray-900">
                0 / 2,547
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">0%</span>
              <p className="text-sm text-gray-500">tài sản đã kiểm kê</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />
          Thống kê trạng thái tài sản
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* MATCHED */}
          <div className="text-center p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="85, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">85%</span>
              </div>
            </div>
            <div className="font-medium text-green-800">MATCHED</div>
            <div className="text-sm text-green-600">2,165 tài sản</div>
          </div>

          {/* MISSING */}
          <div className="text-center p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="8, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">8%</span>
              </div>
            </div>
            <div className="font-medium text-red-800">MISSING</div>
            <div className="text-sm text-red-600">204 tài sản</div>
          </div>

          {/* EXCESS */}
          <div className="text-center p-4 rounded-lg border border-blue-200 bg-blue-50">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="4, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">4%</span>
              </div>
            </div>
            <div className="font-medium text-blue-800">EXCESS</div>
            <div className="text-sm text-blue-600">102 tài sản</div>
          </div>

          {/* BROKEN */}
          <div className="text-center p-4 rounded-lg border border-orange-200 bg-orange-50">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray="2, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-600">2%</span>
              </div>
            </div>
            <div className="font-medium text-orange-800">BROKEN</div>
            <div className="text-sm text-orange-600">51 tài sản</div>
          </div>

          {/* LIQUIDATION_PROPOSED */}
          <div className="text-center p-4 rounded-lg border border-purple-200 bg-purple-50">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray="1, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">1%</span>
              </div>
            </div>
            <div className="font-medium text-purple-800">LIQUIDATION</div>
            <div className="text-sm text-purple-600">25 tài sản</div>
          </div>
        </div>
      </div>
    </div>
  );
};
