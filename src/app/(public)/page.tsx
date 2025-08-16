import Link from "next/link";
import Image from "next/image";
import ContactModalButton from "@/components/modal/ContactModalButton.client";

export default function HomePage() {
  return (
    <div className="min-h-screen relative flex flex-col bg-[#F7FEFE]">
      <div
        className="w-full bg-no-repeat lg:bg-cover bg-[left_-380px_center] bg-[length:170%] md:bg-[left_-720px_center] md:bg-[length:200%] lg:bg-center"
        style={{
          backgroundImage: "url('/images/banner_lading.svg')",
        }}
      >
        {/* Header */}
        <header className="bg-white shadow-lg rounded-b-4xl backdrop-blur-md mb-4 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center py-4">
              {/* Logo + title */}
              <div className="flex items-center gap-5">
                <Image
                  src="/images/ic_round-qr-code.svg"
                  alt="ic_round-qr-code"
                  width={40}
                  height={40}
                  className="sm:w-12 sm:h-12 w-10 h-10"
                />
                <h1 className="text-black font-inter font-bold leading-normal text-2xl sm:text-[32px]">
                  QR Check-in
                </h1>
              </div>

              {/* Login button */}
              <div className="">
                <Link
                  href="/login"
                  className="px-4 md:px-8 py-2 md:py-3 sm:px-12 sm:py-4 rounded-md text-white
          font-inter text-[14px] sm:text-[16px] font-bold leading-normal
          transition duration-300 hover:scale-105
          bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7]
          hover:from-[#2FE1C1] hover:to-[#2FE1C1]"
                >
                  ĐĂNG NHẬP
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-24 pt-4 md:py-24">
          <div className="w-full mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mx-auto max-w-7xl gap-12">
              {/* Left side - 3D Phone illustration */}
              <div className="relative hidden lg:block justify-center lg:justify-start w-full lg:w-1/2">
                <div className="relative">
                  <Image
                    src="/images/Phone.svg"
                    alt="Phone"
                    width={665}
                    height={952}
                    className="object-contain w-full max-w-[400px] lg:max-w-none"
                  />
                  <Image
                    src="/images/Start_New.svg"
                    alt="Start"
                    width={650}
                    height={570}
                    className="absolute -top-14 left-[60%] -translate-x-1/2 object-contain w-[70%] lg:w-auto"
                  />
                </div>
              </div>

              {/* Right side - Content */}
              <div className="flex flex-col items-center lg:items-start gap-6 w-full lg:w-[488px] text-center lg:text-left">
                <h1 className="text-black font-inter text-3xl md:text-4xl lg:text-[48px] font-bold leading-normal">
                  Quản lý sự kiện thực tế{" "}
                  <span className="block sm:inline text-[#2EE1C0] italic">
                    bằng QR Code
                  </span>
                </h1>

                <div className="text-black font-inter text-lg md:text-xl lg:text-[24px] font-bold leading-normal">
                  <p>
                    Đã phục vụ{" "}
                    <span className="text-[#2EE1C0] italic">120+ sự kiện</span>{" "}
                    lớn nhỏ, <br className="hidden md:block" />
                    <span className="text-[#2EE1C0] italic">35,000+</span> lượt
                    check-in thực tế, tin dùng bởi các doanh nghiệp, trường học
                    và tổ chức uy tín.
                  </p>
                </div>

                <div className="flex justify-center lg:justify-start">
                  <ContactModalButton />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Content */}

      <div className="flex flex-col mt-[-5rem]  md:mt-[-5rem] xl:mt-[-10rem]">
        <section className="w-full px-4 sm:px-6 lg:px-8 md:mb-16">
          <div className="mx-auto bg-white w-full pt-8 pb-16 px-6 sm:px-10 md:px-[65px] rounded-3xl shadow-[4px_4px_40px_0_rgba(0,0,0,0.10)] ">
            <div className="text-center flex flex-col gap-6 mb-12 mx-auto">
              <h2 className="text-black font-inter text-2xl sm:text-3xl md:text-5xl font-bold leading-normal">
                Tính năng nổi bật
              </h2>
              <div className="text-gray-500 text-base sm:text-lg md:text-xl font-medium leading-normal mx-auto">
                Được kiểm chứng qua nhiều sự kiện thực tế, đáp ứng mọi nhu cầu
                quản lý sự kiện chuyên nghiệp
              </div>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center mx-auto w-fit">
                {/* Item 1 */}
                <div className="shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] flex flex-col justify-between pt-8 ps-6 bg-[#EEF3FF] hover:bg-[#C3D4FF] rounded-2xl hover:scale-105 transition-transform duration-300 w-full max-w-[384px] min-h-[380px]">
                  <div className="flex flex-col gap-6 text-left pe-6">
                    <div className="w-[92px] h-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-[#316BFF] font-inter text-xl sm:text-2xl font-bold leading-normal">
                      Quản lý sự kiện
                    </h3>
                    <p className="text-[#929292] text-sm sm:text-base font-inter font-medium leading-normal">
                      Tạo, chỉnh sửa, theo dõi tiến độ và số liệu sự kiện, hỗ
                      trợ nhiều loại hình: hội thảo, workshop, lễ khai trương...
                    </p>
                  </div>
                  <div className="overflow-hidden">
                    <Image
                      src="/images/feature_1_New.svg"
                      alt="feature_1"
                      width={373}
                      height={268}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col justify-between pt-8 ps-6 bg-[#EFFFF2] hover:bg-[#CBFDD5] rounded-2xl shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] hover:scale-105 transition-transform duration-300 w-full max-w-[384px] min-h-[380px]">
                  <div className="flex flex-col gap-6 text-left pe-6">
                    <div className="w-[92px] h-1 bg-[#00C424] rounded-full"></div>
                    <h3 className="text-[#00C424] font-inter text-xl sm:text-2xl font-bold leading-normal">
                      Quản lý người tham dự
                    </h3>
                    <p className="text-[#929292] text-sm sm:text-base font-inter font-medium leading-normal">
                      Import danh sách từ Excel, gửi QR code qua email, check-in
                      nhanh chóng, xuất báo cáo điểm danh thực tế.
                    </p>
                  </div>
                  <div className="overflow-hidden">
                    <Image
                      src="/images/feature_2_New.svg"
                      alt="feature_2"
                      width={373}
                      height={268}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col justify-between pt-8 ps-6 bg-[#F4EBFF] hover:bg-[#E0C7FF] rounded-2xl shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] hover:scale-105 transition-transform duration-300 w-full max-w-[384px] min-h-[380px]">
                  <div className="flex flex-col gap-6 text-left pe-6">
                    <div className="w-[92px] h-1 bg-[#6000D5] rounded-full"></div>
                    <h3 className="text-[#6000D5] font-inter text-xl sm:text-2xl font-bold leading-normal">
                      Báo cáo phân tích
                    </h3>
                    <p className="text-[#929292] text-sm sm:text-base font-inter font-medium leading-normal">
                      Dashboard trực quan, thống kê tỷ lệ check-in, xuất file
                      báo cáo cho từng sự kiện thực tế.
                    </p>
                  </div>
                  <div className="overflow-hidden flex justify-end">
                    <Image
                      src="/images/feature_3_New.svg"
                      alt="feature_3"
                      width={368}
                      height={268}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Activity */}
        <section className="py-16 bg-transparent rounded-4xl md:pt-0 mx-2 md:mx-8 mb-16 ">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 text-left md:items-start items-center mb-8 md:mb-20">
              <h2 className="text-black font-inter text-[32px] sm:text-3xl md:text-[48px] font-bold leading-normal">
                Cách hoạt động
              </h2>
              <p className="text-[#929292] font-inter text-base sm:text-lg md:text-[24px] font-medium leading-normal">
                Chỉ 3 bước đơn giản để bắt đầu sử dụng hệ thống
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
              {/* Step 1 */}
              <div className="shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] pt-6 pb-8 flex flex-col gap-8 items-center text-center w-full max-w-[384px] rounded-[32px] bg-[#ECFFFD] hover:bg-[#D9FFFA] shadow-[ -4px_4px_40px_rgba(0,0,0,0.10) ] transition-all duration-300">
                <div className="flex flex-col justify-center items-center gap-6 px-4 max-w-[336px]">
                  <div className="w-[92px] h-1 bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] rounded-full "></div>
                  <h3 className="font-inter text-lg sm:text-xl md:text-[24px] font-bold leading-normal bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] text-transparent bg-clip-text">
                    1. Tạo sự kiện
                  </h3>
                  <p className="text-[#929292] text-sm sm:text-base text-center font-inter font-medium leading-normal">
                    Đăng ký sự kiện và thêm thông tin khách mời.
                  </p>
                </div>
                <Image
                  src="/images/activity_1.svg"
                  alt="Tạo sự kiện"
                  width={120}
                  height={120}
                  className="max-w-full h-auto"
                />
              </div>

              {/* Step 2 */}
              <div className="shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] pt-6 pb-8 flex flex-col gap-8 items-center text-center w-full max-w-[384px] rounded-[32px] bg-[#ECFFFD] hover:bg-[#D9FFFA] shadow-[ -4px_4px_40px_rgba(0,0,0,0.10) ] transition-all duration-300">
                <div className="flex flex-col justify-center items-center gap-6 px-4 max-w-[336px]">
                  <div className="w-[92px] h-1 bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] rounded-full"></div>
                  <h3 className="font-inter text-lg sm:text-xl md:text-[24px] font-bold leading-normal bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] text-transparent bg-clip-text">
                    2. Gửi mã QR
                  </h3>
                  <p className="text-[#929292] text-sm sm:text-base text-center font-inter font-medium leading-normal">
                    Hệ thống tự động tạo và gửi mã QR cho khách mời.
                  </p>
                </div>
                <Image
                  src="/images/activity_2.svg"
                  alt="Gửi mã QR"
                  width={120}
                  height={120}
                  className="max-w-full h-auto"
                />
              </div>

              {/* Step 3 */}
              <div className="shadow-[-4px_4px_40px_0_rgba(0,0,0,0.10)] pt-6 pb-8 flex flex-col gap-8 items-center text-center w-full max-w-[384px] rounded-[32px] bg-[#ECFFFD] hover:bg-[#D9FFFA] shadow-[ -4px_4px_40px_rgba(0,0,0,0.10) ] transition-all duration-300">
                <div className="flex flex-col justify-center items-center gap-6 px-4 max-w-[336px]">
                  <div className="w-[92px] h-1 bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] rounded-full"></div>
                  <h3 className="font-inter text-lg sm:text-xl md:text-[24px] font-bold leading-normal bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] text-transparent bg-clip-text">
                    3. Điểm danh nhanh chóng
                  </h3>
                  <p className="text-[#929292] text-sm sm:text-base text-center font-inter font-medium leading-normal">
                    Khách mời check-in bằng QR code, theo dõi real-time.
                  </p>
                </div>
                <Image
                  src="/images/activity_3.svg"
                  alt="Điểm danh nhanh chóng"
                  width={120}
                  height={120}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Review */}
        <section className="py-16 bg-white rounded-3xl  mx-2 md:mx-8 mb-16 shadow-[4px_4px_40px_0_rgba(0,0,0,0.10)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 text-center mb-6">
              <h2 className="text-black text-center font-inter text-[32px] md:text-[48px] not-italic font-bold leading-normal">
                Khách hàng thực tế nói gì?
              </h2>
              <p className="text-[#929292] text-center font-inter text-base md:text-[24px] not-italic font-medium leading-normal">
                Phản hồi từ các đơn vị đã sử dụng QR Check-in cho sự kiện thật
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Review 1 */}
              <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] shadow-[0_25px_45px_-12px_rgba(18,26,43,0.20)]">
                <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center gap-6">
                  <p className="text-[#111827] font-inter text-[14px] not-italic font-medium leading-[20px] text-justify">
                    Chúng tôi đã tổ chức hội thảo 500 khách, check-in chỉ mất 10
                    phút nhờ QR Check-in. Báo cáo xuất file rất tiện!
                  </p>

                  <div className="flex flex-col items-center gap-5 w-full">
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Image
                          key={i}
                          src="/images/star.svg"
                          alt="Start-person"
                          width={16}
                          height={16}
                          className="max-w-full h-auto"
                        />
                      ))}
                    </div>

                    <div className="text-center flex flex-col gap-4 w-full">
                      <div className="border border-gray-300 w-full"></div>
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          NM
                        </span>
                      </div>
                      <h4 className="text-[#111827] text-center font-inter text-[24px] not-italic font-bold leading-[32px]">
                        Nguyễn Thị Mai
                      </h4>
                      <p className="text-[#111827] font-inter text-[12px] not-italic font-medium leading-[18px]">
                        Công ty sự kiện VNM - Trưởng phòng tổ chức
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] shadow-[0_25px_45px_-12px_rgba(18,26,43,0.20)]">
                <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center gap-6">
                  <p className="text-[#111827] font-inter text-[14px] not-italic font-medium leading-[20px] text-justify">
                    QR Check-in giúp trường tôi quản lý điểm danh học sinh dự lễ
                    khai giảng rất chuyên nghiệp, phụ huynh cũng hài lòng.
                  </p>

                  <div className="flex flex-col items-center gap-5 w-full">
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Image
                          key={i}
                          src="/images/star.svg"
                          alt="Start-person"
                          width={16}
                          height={16}
                          className="max-w-full h-auto"
                        />
                      ))}
                    </div>

                    <div className="text-center flex flex-col gap-4 w-full">
                      <div className="border border-gray-300 w-full"></div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          NQ
                        </span>
                      </div>
                      <h4 className="text-[#111827] text-center font-inter text-[24px] not-italic font-bold leading-[32px]">
                        Ngô Vũ Quyền
                      </h4>
                      <p className="text-[#111827] font-inter text-[12px] not-italic font-medium leading-[18px]">
                        Công ty TNHH LAZTAR - CEO
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] shadow-[0_25px_45px_-12px_rgba(18,26,43,0.20)]">
                <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center gap-6">
                  <p className="text-[#111827] font-inter text-[14px] not-italic font-medium leading-[20px] text-justify">
                    Chúng tôi tổ chức giải chạy bộ 1.200 người, hệ thống
                    check-in QR hoạt động ổn định, không bị nghẽn.
                  </p>

                  <div className="flex flex-col items-center gap-5 w-full">
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Image
                          key={i}
                          src="/images/star.svg"
                          alt="Start-person"
                          width={16}
                          height={16}
                          className="max-w-full h-auto"
                        />
                      ))}
                    </div>

                    <div className="text-center flex flex-col gap-4 w-full">
                      <div className="border border-gray-300 w-full"></div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          PC
                        </span>
                      </div>
                      <h4 className="text-[#111827] text-center font-inter text-[24px] not-italic font-bold leading-[32px]">
                        Phạm Minh Châu
                      </h4>
                      <p className="text-[#111827] font-inter text-[12px] not-italic font-medium leading-[18px]">
                        Vietnam Run 2025 - Ban tổ chức
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actual image */}
        <section className="bg-gradient-to-br mx-2 md:mx-8 mb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 flex flex-col items-center md:items-start gap-4 md:gap-8">
              <h2 className="text-black font-inter text-[32px] md:text-[48px] not-italic font-bold leading-normal">
                Hình ảnh thực tế
              </h2>
              <p className="text-[#929292] font-inter text-base md:text-[24px] not-italic font-medium leading-normal">
                Khoảnh khắc tại các sự kiện đã sử dụng QR Check-in
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="flex flex-col gap-4 w-full max-w-[384px] mx-auto">
                {/* Image */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full">
                  <div className="relative w-full aspect-square">
                    <Image
                      src="/images/IMG1.svg"
                      alt="Business conference with attendees seated at tables"
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
                    />
                  </div>
                </div>

                {/* Title + badge */}
                <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] w-full">
                  <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center gap-2">
                    <h3 className="text-black text-center font-inter text-[16px] not-italic font-bold leading-[24px]">
                      CHECK-IN HỘI THẢO DOANH NGHIỆP
                    </h3>
                    <div className="inline-flex w-full items-center justify-center bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 rounded-full text-xs shadow-md text-white font-inter text-[12px] not-italic font-bold leading-[16px]">
                      500 KHÁCH THAM DỰ
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col gap-4 w-full max-w-[384px] mx-auto">
                {/* Image */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full">
                  <div className="relative w-full aspect-square">
                    <Image
                      src="/images/IMG2.svg"
                      alt="Business conference with attendees seated at tables"
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
                    />
                  </div>
                </div>

                {/* Title + badge */}
                <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] w-full">
                  <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center gap-2">
                    <h3 className="text-black text-center font-inter text-[16px] not-italic font-bold leading-[24px]">
                      ĐIỂM DANH HỌC SINH LỄ KHAI GIẢNG
                    </h3>
                    <div className="inline-flex w-full items-center justify-center bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 rounded-full text-xs shadow-md text-white font-inter text-[12px] not-italic font-bold leading-[16px]">
                      2000 HỌC SINH THAM DỰ
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col gap-4 w-full max-w-[384px] mx-auto">
                {/* Image */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full">
                  <div className="relative w-full aspect-square">
                    <Image
                      src="/images/IMG3.svg"
                      alt="Business conference with attendees seated at tables"
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
                    />
                  </div>
                </div>

                {/* Title + badge */}
                <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#2FE1C1] to-[#00CBE7] w-full">
                  <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center gap-2">
                    <h3 className="text-black text-center font-inter text-[16px] not-italic font-bold leading-[24px]">
                      GIẢI CHẠY BỘ VIETNAM RUN 2025
                    </h3>
                    <div className="inline-flex w-full items-center justify-center bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 rounded-full text-xs shadow-md text-white font-inter text-[12px] not-italic font-bold leading-[16px]">
                      1500 THÍ SINH THAM DỰ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8 bg-white/90 rounded-3xl mx-2 md:mx-8 shadow-[4px_4px_40px_0_rgba(0,0,0,0.10)]">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8 flex flex-col gap-8">
              <h2 className="text-black text-center font-inter text-[32px] md:text-[48px] not-italic font-bold leading-none">
                Câu hỏi thường gặp
              </h2>
              <p className="text-[#929292] text-center font-inter text-base md:text-[24px] not-italic font-medium leading-none">
                Bạn thắc mắc gì về QR Check-in? Xem giải đáp bên dưới!
              </p>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-8 mx-auto">
                <div className="flex flex-col items-start gap-4 ">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/images/question-1.svg"
                      alt="Business conference with attendees seated at tables"
                      height={50}
                      width={72}
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-black font-inter text-xl md:text-[24px] not-italic font-bold leading-none">
                      QR Check-in có phù hợp cho sự kiện nhỏ không?
                    </h3>
                  </div>
                  <div className="ps-[88px]">
                    <p className="text-[#929292] font-inter text-[14px] md:text-[24px] not-italic font-medium leading-none">
                      Hoàn toàn phù hợp! Hệ thống linh hoạt cho cả sự kiện nhỏ
                      lẫn lớn, dễ dàng tuỳ chỉnh theo nhu cầu.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/images/question-2.svg"
                      alt="Business conference with attendees seated at tables"
                      height={50}
                      width={72}
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-black font-inter text-xl md:text-[24px] not-italic font-bold leading-none">
                      Khách mời không rành công nghệ có dùng được không?
                    </h3>
                  </div>
                  <div className="ps-[88px]">
                    <p className="text-[#929292] font-inter text-[14px] md:text-[24px] not-italic font-medium leading-none">
                      Chỉ cần điện thoại có camera, thao tác quét QR rất đơn
                      giản, không cần cài app.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/images/question-3.svg"
                      alt="Business conference with attendees seated at tables"
                      height={50}
                      width={72}
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-black font-inter text-xl md:text-[24px] not-italic font-bold leading-none">
                      Có thể xuất báo cáo sau sự kiện không?
                    </h3>
                  </div>
                  <div className="ps-[88px]">
                    <p className="text-[#929292] font-inter text-[14px] md:text-[24px] not-italic font-medium leading-none">
                      Bạn có thể xuất file Excel thống kê chi tiết ngay sau khi
                      sự kiện kết thúc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white text-white py-10 mt-12 rounded-t-4xl shadow-[4px_4px_40px_0_rgba(0,0,0,0.10)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/images/ic_round-qr-code.svg"
                alt="ic_round-qr-code"
                width={40}
                height={40}
                className="sm:w-12 sm:h-12 w-10 h-10"
              />
              <span className="text-black font-inter text-[32px] md:text-3xl not-italic font-bold leading-normal">
                QR Check-in
              </span>
            </div>
            <p className="text-[#929292] text-center font-inter text-lg md:text-2xl not-italic font-medium leading-normal mb-4">
              Quyền riêng tư · Điều khoản
              <span className="block sm:inline"> · Quảng cáo · Cookie</span>
            </p>
            <p className="text-[#929292] text-center font-inter text-sm md:text-[16px] not-italic font-medium leading-normal">
              © 2025 LazSphere — A product of LAZTAR
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
