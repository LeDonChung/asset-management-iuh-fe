/**
 * Generate Excel template for importing assets
 * This function creates a template with headers and sample data
 */

export interface TemplateColumn {
  header: string;
  width: number;
  example?: string;
}

export const IMPORT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Mã kế toán",
    width: 15,
    example: ""
  },
  {
    header: "Mã tài sản",
    width: 15,
    example: ""
  },
  {
    header: "Vị trí",
    width: 15,
    example: "4A01.01"
  },
  {
    header: "Tên tài sản",
    width: 35,
    example: "* Máy vi tính Vostro 270MT"
  },
  {
    header: "Loại tài sản",
    width: 20,
    example: "Tài sản cố định"
  },
  {
    header: "Danh mục",
    width: 25,
    example: "Máy tính"
  },
  {
    header: "Nước SX",
    width: 15,
    example: "Trung Quốc"
  },
  {
    header: "ĐVT",
    width: 10,
    example: "Bộ"
  },
  {
    header: "Số lượng",
    width: 12,
    example: "1"
  },
  {
    header: "Ngày nhập",
    width: 15,
    example: "01/01/2024"
  },
  {
    header: "Gói mua",
    width: 12,
    example: "1"
  },
  {
    header: "RFID",
    width: 30,
    example: "E280691500004021E7477C8D"
  },
  {
    header: "Vị trí",
    width: 15,
    example: "29"
  },
];

/**
 * Generate and download Excel template using XLSX library
 */
export async function downloadTemplateExcel() {
  // Dynamically import xlsx to avoid SSR issues
  const XLSX = await import('xlsx');
  
  // Create headers row
  const headers = IMPORT_TEMPLATE_COLUMNS.map(col => col.header);
  
  // Create example data rows
  const exampleRows = [
    [
      "", // Mã kế toán (để trống, hệ thống tự sinh)
      "", // Mã tài sản (để trống, hệ thống tự sinh)
      "4A01.01", // Vị trí (Mã phòng)
      "* Máy vi tính Vostro 270MT", // Tên tài sản
      "Tài sản cố định", // Loại tài sản
      "Máy tính", // Danh mục
      "Trung Quốc", // Nước SX
      "Bộ", // ĐVT
      "1", // Số lượng
      "01/01/2024", // Ngày nhập
      "1", // Gói mua
      "E280691500004021E7477C8D", // RFID
      "29", // Vị trí trong phòng
    ],
    [
      "",
      "",
      "4A01.01",
      "Máy tính Dell Optiplex 7070",
      "Tài sản cố định",
      "Máy tính",
      "Trung Quốc",
      "Bộ",
      "1",
      "01/01/2024",
      "1",
      "E280691500004021E7A7AC8D",
      "30",
    ],
    [
      "",
      "",
      "4A01.01",
      "Màn hình Vostro 270MT",
      "Tài sản cố định",
      "Màn hình",
      "Trung Quốc",
      "Bộ",
      "1",
      "01/01/2024",
      "1",
      "E280691500004021E748B88D",
      "29",
    ],
  ];

  // Combine headers with example data
  const worksheetData = [headers, ...exampleRows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = IMPORT_TEMPLATE_COLUMNS.map(col => ({ wch: col.width }));

  // Style the header row (bold, background color)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách tài sản');

  // Add instructions sheet
  const instructionsData = [
    ['HƯỚNG DẪN IMPORT TÀI SẢN'],
    [''],
    ['Các cột trong file Excel:'],
    ['STT', 'Tên cột', 'Bắt buộc', 'Mô tả', 'Ví dụ'],
    ['1', 'Mã kế toán', 'Không', 'Để trống, hệ thống tự sinh', ''],
    ['2', 'Mã tài sản', 'Không', 'Để trống, hệ thống tự sinh', ''],
    ['3', 'Vị trí', 'Không', 'Mã phòng trong hệ thống', '4A01.01'],
    ['4', 'Tên tài sản', 'CÓ', 'Tên đầy đủ của tài sản', 'Máy vi tính Vostro 270MT'],
    ['5', 'Loại tài sản', 'Không', 'Tài sản cố định hoặc Công cụ dụng cụ', 'Tài sản cố định'],
    ['6', 'Danh mục', 'Không', 'Hệ thống tự tạo nếu chưa có', 'Máy tính'],
    ['7', 'Nước SX', 'Không', 'Nước sản xuất', 'Trung Quốc'],
    ['8', 'ĐVT', 'Không', 'Đơn vị tính', 'Bộ, Cái, Chiếc'],
    ['9', 'Số lượng', 'Không', 'Mặc định 1 cho tài sản cố định', '1'],
    ['10', 'Ngày nhập', 'Không', 'Định dạng dd/mm/yyyy', '01/01/2024'],
    ['11', 'Gói mua', 'Không', 'Số gói thầu', '0'],
    ['12', 'RFID', 'Không', 'Mã RFID (chỉ cho tài sản cố định)', 'E280691500004021E7477C8D'],
    ['13', 'Vị trí', 'Không', 'Vị trí cụ thể trong phòng', '29'],
    [''],
    ['LƯU Ý QUAN TRỌNG:'],
    ['- Cột "Tên tài sản" là BẮT BUỘC phải điền'],
    ['- Mã kế toán và Mã tài sản để trống, hệ thống tự động sinh'],
    ['- Nếu chưa có danh mục, hệ thống sẽ tự động tạo mới'],
    ['- Mã phòng phải tồn tại trong hệ thống (ví dụ: 4A01.01)'],
    ['- Loại tài sản: "Tài sản cố định" hoặc "Công cụ dụng cụ"'],
    ['- RFID chỉ áp dụng cho Tài sản cố định, có thể để trống'],
    ['- Ngày nhập theo định dạng dd/mm/yyyy (ví dụ: 14/12/2025)'],
    [''],
    ['XỬ LÝ LỖI:'],
    ['- Nếu có lỗi, hệ thống sẽ hiển thị số dòng và thông báo lỗi cụ thể'],
    ['- Các dòng thành công vẫn được import, chỉ bỏ qua dòng lỗi'],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 15 },
    { wch: 50 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Hướng dẫn');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'Mau_Import_Tai_San.xlsx');
}

// Keep CSV version for backward compatibility
export function generateTemplateCSV(): string {
  const headers = IMPORT_TEMPLATE_COLUMNS.map(col => col.header).join(",");
  const examples = IMPORT_TEMPLATE_COLUMNS.map(col => `"${col.example || ""}"`).join(",");
  
  return `${headers}\n${examples}`;
}

export function downloadTemplateCSV() {
  const csv = generateTemplateCSV();
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", "Mau_Import_Tai_San.csv");
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
