"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function ContactModalButton() {
  const [showContact, setShowContact] = useState(false);
  return (
    <>
      <button
        className="inline-block bg-transparent px-4 md:px-12 py-2 md:py-4 rounded-lg border text-black hover:border-transparent font-inter text-[16px] not-italic font-bold leading-normal hover:bg-gradient-to-r hover:text-white  hover:from-[#2FE1C1] hover:to-[#00CBE7] transition cursor-pointer"
        onClick={() => setShowContact(true)}
        type="button"
      >
        TRUY CẬP NGAY
      </button>
      {showContact &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setShowContact(false)}
                aria-label="Đóng"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-[#2EE1C0]">
                Liên hệ công ty
              </h2>
              <div className="space-y-2 text-gray-700">
                <div>
                  <span className="font-semibold">Công ty:</span> Công ty TNHH
                  LAZTAR
                </div>
                <div>
                  <span className="font-semibold">Hotline:</span> 02866867027
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  contact@laztar.com
                </div>
                <div>
                  <span className="font-semibold">Địa chỉ:</span> 86/11 Ngô Chí
                  Quốc, Tam Bình, Thành phố Hồ Chí Minh
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
