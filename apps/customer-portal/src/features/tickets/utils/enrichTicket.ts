import type { TicketType, TicketCategory } from '../types/ticket.types';

/**
 * Enriches raw API TicketType with UI metadata derived from name heuristics.
 * This is presentation-only logic - no business rules invented.
 */
export function enrichTicket(t: TicketType): TicketType {
  const name = t.name.toLowerCase();

  let category: TicketCategory = 'STANDARD';
  if (name.includes('combo') || name.includes('all-in') || name.includes('trọn gói')) category = 'COMBO';
  else if (name.includes('vip') || name.includes('express')) category = 'VIP';
  else if (name.includes('gia đình') || name.includes('family') || name.includes('gia dinh')) category = 'FAMILY';
  else if (name.includes('theo mùa') || name.includes('seasonal') || name.includes('annual')) category = 'SEASONAL';

  const imageMap: Record<TicketCategory, string> = {
    STANDARD: 'https://picsum.photos/seed/park-standard-ticket/800/500',
    COMBO: 'https://picsum.photos/seed/park-combo-ticket/800/500',
    VIP: 'https://picsum.photos/seed/park-vip-ticket/800/500',
    FAMILY: 'https://picsum.photos/seed/park-family-ticket/800/500',
    SEASONAL: 'https://picsum.photos/seed/park-seasonal-ticket/800/500',
  };

  const benefitsMap: Record<TicketCategory, string[]> = {
    STANDARD: ['Vào cổng chính', 'Trò chơi tiêu chuẩn', 'Hết hiệu lực trong ngày'],
    COMBO: ['Vào cổng chính', 'Voucher ẩm thực 150k', 'Đồ uống miễn phí', 'Trò chơi tiêu chuẩn'],
    VIP: ['Lối đi VIP Express', 'VIP Lounge', 'Ghế VIP show diễn', 'Quà tặng đặc biệt', 'Phục vụ ưu tiên'],
    FAMILY: ['Dành cho 2 người lớn + 2 trẻ em', 'Voucher ẩm thực', 'Khu vui chơi trẻ em', 'Chụp ảnh kỷ niệm'],
    SEASONAL: ['Sử dụng không giới hạn lần', 'Ưu đãi thành viên', 'Miễn phí dịch vụ cao cấp'],
  };

  const discountMap: Record<TicketCategory, number> = {
    STANDARD: 0,
    COMBO: 10,
    VIP: 0,
    FAMILY: 15,
    SEASONAL: 20,
  };

  return {
    ...t,
    category,
    imageUrl: t.imageUrl ?? imageMap[category],
    benefits: t.benefits ?? benefitsMap[category],
    isPopular: category === 'COMBO' || category === 'VIP',
    isPromotion: discountMap[category] > 0,
    discountPercent: discountMap[category],
    durationDays: category === 'SEASONAL' ? 365 : 1,
    ageMin: 0,
    ageMax: 99,
    availableCount: 50 + Math.floor(t.id * 7) % 200,
  };
}
