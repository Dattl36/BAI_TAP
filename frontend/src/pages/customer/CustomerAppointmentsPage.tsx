import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { appointmentsApi } from "../../api/appointments.api";
import { PageLoading } from "../../components/common/PageLoading";
import { ErrorState } from "../../components/common/ErrorState";
import { normalizePaginatedResponse } from "../../utils/apiResponse";

// Service image helper mapping to the elegant images from template
const getServiceImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("phục hồi") || n.includes("dưỡng") || n.includes("treatment")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuBRxqnAs6f9esPYn3-ikWbqnstuu43d09wG04b2QoXZh9BYH0ykyhgRITAcPesO321tz4ltTSfHrER1w9i2KErJMAvCjwzgINzezh8B6Ki6V7IlyKATbNxM4oNPcacoxGlmwx8FKo2YbwPLdv-7ocIFGM41FOFbAAXxhL8jfQPxaOODixaHyG1mYkFcRR8aNmfVp1HBM0Lop2RWgED-vZs3YQUVkJqaGlNkBjCitjeJFpv8ZO6gSBediV_8JW0NYB52FtFoMjlPn9Y";
  }
  if (n.includes("cắt") || n.includes("tạo kiểu") || n.includes("style") || n.includes("cut")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ-cPESrzti5-LFk2wPlcxKrJg9IgjTvvuzynVK0XSPzFEpfcTy_GCXTjBuQY3tVTAlsZv22kLgcpqhLkjYTJKCKNLZdbTk9ny7yBbt7VfurS2KaF2rhflAk0yFOPutIR4921WXy5TdxhgyVChvoF2DkZQGfk1UZKRXGA_CWimHgo6XXXH6k1F1eWn-4ehJ0WS_6E8XvcPFT9l3sH4M-71Xi_yg5ZWpaonENUYA7TMfZ3B7VfaSGwdYTSFLmNRfORztcvIvjZqgoQ";
  }
  return "https://lh3.googleusercontent.com/aida-public/AB6AXuBp38MHC966woQFO-eVAk4QwnKmvqN7GfmuoTOcUtIgLdIGlA4MhotiR3I5f7ygjki04nXlaZQFJtCBAycyCZ7v_MizHgd601x6Zu-HvxnoOpoMT5titUWgh99bbwFeeBDzkmrbA8VMYgW3v2aprW8Ok6rywmBEgPA37ECYLTtnPIotaAGqXlFovtlhK3vIw8Zgi3zqH4gsqxdbgjcolW8pWFWud4uJfCHWf2D1fQu-tLTlcFQ9X-U4a9eCqI-cElHF4wM5PVjf24c";
};

// Date time formatter helper
const formatFullDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBD";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} vào lúc ${hours}:${minutes}`;
};

// Status mapping helper
const getStatusBadge = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "completed") {
    return { label: "Đã hoàn thành", classes: "bg-[#F0FDF4] text-[#166534]" };
  }
  if (["cancelled", "declined"].includes(s)) {
    return { label: "Đã hủy", classes: "bg-[#FEF2F2] text-[#991B1B]" };
  }
  return { label: "Sắp tới", classes: "bg-[#FFF7ED] text-[#9A3412]" };
};

// Dot color helper
const getDotColor = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || "";
  if (s === "completed") {
    return "bg-secondary";
  }
  if (["cancelled", "declined"].includes(s)) {
    return "bg-error";
  }
  return "bg-secondary-fixed";
};

export const CustomerAppointmentsPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => appointmentsApi.list({ ordering: "-scheduled_start" }),
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic Tailwind CDN Injection and intersection observer setup
  useEffect(() => {
    // 1. Add Tailwind Play CDN
    const existingScript = document.getElementById("tailwind-cdn") as HTMLScriptElement | null;
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com?plugins=forms,container-queries";
      script.id = "tailwind-cdn";
      document.head.appendChild(script);
    }

    // 2. Add Tailwind Config
    const existingConfig = document.getElementById("tailwind-config-script") as HTMLScriptElement | null;
    if (!existingConfig) {
      const configScript = document.createElement("script");
      configScript.id = "tailwind-config-script";
      configScript.innerHTML = `
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                  "inverse-primary": "#c6c7c2",
                  "on-background": "#1a1c1a",
                  "surface-container-lowest": "#ffffff",
                  "on-primary-fixed-variant": "#454744",
                  "secondary-fixed": "#ffe088",
                  "surface-dim": "#dbdad7",
                  "surface-variant": "#e3e2e0",
                  "on-secondary": "#ffffff",
                  "error": "#ba1a1a",
                  "surface": "#faf9f6",
                  "on-tertiary": "#ffffff",
                  "surface-container": "#efeeeb",
                  "on-error-container": "#93000a",
                  "error-container": "#ffdad6",
                  "surface-bright": "#faf9f6",
                  "outline-variant": "#c5c7c1",
                  "on-secondary-fixed-variant": "#574500",
                  "on-primary-container": "#6f706c",
                  "tertiary-fixed": "#d9e3f6",
                  "surface-tint": "#5d5f5b",
                  "on-error": "#ffffff",
                  "on-tertiary-container": "#667081",
                  "on-surface-variant": "#454843",
                  "surface-container-high": "#e9e8e5",
                  "primary-container": "#f5f5f0",
                  "on-primary": "#ffffff",
                  "tertiary-fixed-dim": "#bdc7d9",
                  "outline": "#757873",
                  "primary": "#5d5f5b",
                  "on-tertiary-fixed-variant": "#3d4756",
                  "inverse-surface": "#2f312f",
                  "tertiary": "#555f6f",
                  "on-tertiary-fixed": "#121c2a",
                  "surface-container-highest": "#e3e2e0",
                  "on-primary-fixed": "#1a1c19",
                  "secondary-container": "#fed65b",
                  "inverse-on-surface": "#f2f1ee",
                  "surface-container-low": "#f4f3f1",
                  "primary-fixed-dim": "#c6c7c2",
                  "on-secondary-container": "#745c00",
                  "tertiary-container": "#f1f5ff",
                  "on-secondary-fixed": "#241a00",
                  "background": "#faf9f6",
                  "secondary": "#735c00",
                  "primary-fixed": "#e3e3de",
                  "on-surface": "#1a1c1a",
                  "secondary-fixed-dim": "#e9c349"
              },
              "borderRadius": {
                  "DEFAULT": "0.25rem",
                  "lg": "0.5rem",
                  "xl": "0.75rem",
                  "full": "9999px"
              },
              "spacing": {
                  "container-max": "1440px",
                  "margin-mobile": "16px",
                  "unit": "8px",
                  "gutter": "24px",
                  "margin-desktop": "48px"
              },
              "fontFamily": {
                  "body-md": ["Inter"],
                  "headline-lg-mobile": ["Playfair Display"],
                  "headline-xl": ["Playfair Display"],
                  "label-md": ["Inter"],
                  "headline-md": ["Playfair Display"],
                  "label-sm": ["Inter"],
                  "headline-lg": ["Playfair Display"],
                  "body-lg": ["Inter"]
              },
              "fontSize": {
                  "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                  "headline-lg-mobile": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}],
                  "headline-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}],
                  "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
                  "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "500"}],
                  "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
                  "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "500"}],
                  "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}]
              }
            },
          },
        }
      `;
      document.head.appendChild(configScript);
    }

    // 3. Add Google Fonts
    const existingFonts = document.getElementById("google-fonts-appointments") as HTMLLinkElement | null;
    if (!existingFonts) {
      const fontsLink = document.createElement("link");
      fontsLink.id = "google-fonts-appointments";
      fontsLink.rel = "stylesheet";
      fontsLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
      document.head.appendChild(fontsLink);
    }

    // 4. Add Custom Styles
    let customStyles = document.getElementById("custom-styles-appointments");
    if (!customStyles) {
      customStyles = document.createElement("style");
      customStyles.id = "custom-styles-appointments";
      customStyles.innerHTML = `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .timeline-line::before {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 100%;
            background-color: #c5c7c1;
            opacity: 0.3;
        }
        .appointment-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .appointment-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(31, 41, 55, 0.08);
        }

        .reveal-card {
            opacity: 0;
            transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
        }
        .reveal-card-left {
            transform: translateX(-50px);
        }
        .reveal-card-right {
            transform: translateX(50px);
        }
        .reveal-card.is-visible {
            opacity: 1;
            transform: translateX(0);
        }
      `;
      document.head.appendChild(customStyles);
    }

    // Observe reveal elements
    const setupRevealAnimations = () => {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, options);

      const cards = document.querySelectorAll(".reveal-card");
      cards.forEach(card => {
        observer.observe(card);
      });
    };

    const timer = setTimeout(setupRevealAnimations, 500);

    return () => {
      clearTimeout(timer);
      document.getElementById("tailwind-cdn")?.remove();
      document.getElementById("tailwind-config-script")?.remove();
      document.getElementById("google-fonts-appointments")?.remove();
      document.getElementById("custom-styles-appointments")?.remove();
    };
  }, [currentPage, statusFilter, selectedMonth, searchQuery]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const appointmentsList = normalizePaginatedResponse(data || []).results;

  // Filter list of months from appointments for selection dropdown
  const getMonthsList = () => {
    const months: string[] = [];
    appointmentsList.forEach((app) => {
      if (!app.scheduled_start) return;
      const d = new Date(app.scheduled_start);
      if (isNaN(d.getTime())) return;
      const mStr = `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
      if (!months.includes(mStr)) {
        months.push(mStr);
      }
    });
    // Sort months chronologically
    return months.sort((a, b) => {
      const partsA = a.replace("Tháng ", "").split(", ");
      const partsB = b.replace("Tháng ", "").split(", ");
      const dateA = new Date(Number(partsA[1]), Number(partsA[0]) - 1);
      const dateB = new Date(Number(partsB[1]), Number(partsB[0]) - 1);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Filter logic
  const filteredAppointments = appointmentsList.filter((app) => {
    const status = app.status?.toLowerCase() || "";
    if (statusFilter === "upcoming") {
      return ["requested", "confirmed", "arrived", "in_service", "scheduled", "pending"].includes(status);
    }
    if (statusFilter === "completed") {
      return status === "completed";
    }
    if (statusFilter === "cancelled") {
      return ["cancelled", "declined"].includes(status);
    }
    return true;
  });

  const finalAppointments = filteredAppointments.filter((app) => {
    // 1. Month filter
    if (selectedMonth !== "all" && app.scheduled_start) {
      const d = new Date(app.scheduled_start);
      const mStr = `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
      if (mStr !== selectedMonth) return false;
    }
    // 2. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const serviceName = (app.service_details?.name || "").toLowerCase();
      const stylistName = (app.employee_details?.full_name || "").toLowerCase();
      const idStr = String(app.id);
      if (!serviceName.includes(q) && !stylistName.includes(q) && !idStr.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Client-side pagination logic
  const PAGE_SIZE = 5;
  const totalItems = finalAppointments.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAppointments = finalAppointments.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filterTabs = [
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp tới" },
    { id: "completed", label: "Đã hoàn thành" },
    { id: "cancelled", label: "Đã hủy" }
  ] as const;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];

    // Left chevron
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed material-symbols-outlined"
      >
        chevron_left
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-colors ${
              currentPage === i
                ? "bg-primary text-on-primary font-bold"
                : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {i}
          </button>
        );
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        pages.push(
          <span key={`ellipsis-${i}`} className="mx-2 text-on-surface-variant">
            ...
          </span>
        );
      }
    }

    // Right chevron
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed material-symbols-outlined"
      >
        chevron_right
      </button>
    );

    return (
      <section className="max-w-container-max mx-auto px-margin-desktop mt-16 flex justify-center">
        <div className="flex items-center gap-2">{pages}</div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-primary-container pb-24 -mx-6 -mt-8 px-6">
      {/* Header Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop pt-16 pb-12 text-center">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-4">Lịch sử cuộc hẹn của bạn</h1>
        <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">
          Theo dõi các lịch hẹn đã đặt, trải nghiệm dịch vụ trước đó và quản lý lịch đặt lịch của bạn một cách dễ dàng.
        </p>
      </section>

      {/* Filter Bar */}
      <section className="max-w-container-max mx-auto px-margin-desktop mb-16">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-surface-container rounded-lg p-1">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-2 rounded-md font-label-md text-label-md transition-colors ${
                    isActive
                      ? "bg-white shadow-sm text-primary font-medium"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Month filter select */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[160px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                calendar_month
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-8 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary w-full cursor-pointer"
              >
                <option value="all">Tất cả thời gian</option>
                {getMonthsList().map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Search filter input */}
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-label-md focus:outline-none focus:ring-1 focus:ring-secondary w-full md:w-64"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop relative">
        {paginatedAppointments.length > 0 && (
          <div className="timeline-line absolute left-0 right-0 top-0 bottom-0 pointer-events-none hidden md:block"></div>
        )}

        <div className="flex flex-col gap-12 relative">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map((app, index) => {
              const isEven = index % 2 === 0;
              const alignClass = isEven ? "md:justify-end" : "md:justify-start";
              const revealDirClass = isEven ? "reveal-card-right" : "reveal-card-left";
              const dotColor = getDotColor(app.status);
              const statusInfo = getStatusBadge(app.status);

              const serviceName = app.service_details?.name || "Phục hồi tóc tổng quát";
              const stylistName = app.employee_details?.full_name || "Stylist được phân công";
              const formattedDate = formatFullDateTime(app.scheduled_start);
              
              // Handle pricing cleanly
              const priceVal = app.service_details?.price;
              const formattedPrice = priceVal !== undefined && priceVal !== null
                ? `${Number(priceVal).toLocaleString("vi-VN")}đ`
                : "Chưa cập nhật";

              return (
                <div key={app.id} className={`flex flex-col md:flex-row ${alignClass} items-center relative w-full`}>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${dotColor} ring-4 ring-white z-10 hidden md:block`}></div>
                  <div className={`w-full md:w-[45%] reveal-card ${revealDirClass}`}>
                    <div className="appointment-card bg-white p-6 rounded-xl border border-transparent hover:border-secondary-fixed/50 shadow-sm">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            className="w-full h-full object-cover"
                            src={getServiceImage(serviceName)}
                            alt={serviceName}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <div>
                              <span className="text-on-surface-variant font-label-sm text-label-sm block mb-1">
                                MÃ ĐẶT LỊCH #{app.id}
                              </span>
                              <h3 className="font-headline-md text-headline-md text-on-background">
                                {serviceName}
                              </h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm shrink-0 whitespace-nowrap ${statusInfo.classes}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 text-on-surface-variant mb-4">
                            <div className="flex items-center gap-2 font-body-md text-body-md">
                              <span className="material-symbols-outlined text-[18px]">person</span>
                              Stylist: {stylistName}
                            </div>
                            <div className="flex items-center gap-2 font-body-md text-body-md">
                              <span className="material-symbols-outlined text-[18px]">schedule</span>
                              {formattedDate}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-surface-container">
                            <span className="font-headline-md text-headline-md text-secondary">
                              {formattedPrice}
                            </span>
                            <Link
                              to={`/customer/appointments/${app.id}`}
                              className="flex items-center gap-2 text-primary font-label-md text-label-md hover:text-secondary transition-colors group"
                            >
                              Chi tiết
                              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State Container */
            <div className="bg-white p-16 rounded-xl shadow-sm text-center max-w-lg mx-auto border border-gray-100">
              <span className="material-symbols-outlined text-6xl text-primary mb-4 select-none">
                calendar_today
              </span>
              <h3 className="font-headline-md text-headline-md text-on-background mb-2">
                Không tìm thấy lịch hẹn nào
              </h3>
              <p className="text-on-surface-variant mb-8 max-w-xs mx-auto">
                Bạn chưa có lịch hẹn nào phù hợp với bộ lọc tìm kiếm hiện tại.
              </p>
              <Link to="/customer/book">
                <button className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-opacity-95 transition-all shadow-sm">
                  Đặt lịch ngay
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Pagination Section */}
      {renderPagination()}
    </main>
  );
};
