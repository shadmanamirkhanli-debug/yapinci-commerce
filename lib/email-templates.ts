export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  const subject = "Şifrə Bərpası — Yapinci";
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Şifrə Bərpası</h2>" +
    "<p>Şifrənizi bərpa etmək üçün aşağıdakı düyməyə klikləyin. Link 1 saat ərzində keçərlidir.</p>" +
    "<p><a href=\"" + resetUrl + "\" style=\"display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;\">Şifrəni Bərpa Et</a></p>" +
    "<p style=\"color: #666; font-size: 12px;\">Əgər bu sorğunu siz göndərməmisinizsə, bu e-poçtu nəzərə almayın.</p>" +
    "</div>";
  return { subject, html };
}

export function orderConfirmationEmail(params: {
  orderNumber: string;
  total: string;
  customerName: string;
}): { subject: string; html: string } {
  const subject = "Sifariş Təsdiqi — " + params.orderNumber;
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Təşəkkür edirik, " + params.customerName + "!</h2>" +
    "<p>Sifarişiniz uğurla qeydə alındı.</p>" +
    "<p><strong>Sifariş nömrəsi:</strong> " + params.orderNumber + "</p>" +
    "<p><strong>Cəmi:</strong> " + params.total + "</p>" +
    "<p>Sifarişinizin statusunu hesabınızdan izləyə bilərsiniz.</p>" +
    "</div>";
  return { subject, html };
}

export function pashaGuestPaymentLinkEmail(params: {
  orderNumber: string;
  resultUrl: string;
}): { subject: string; html: string } {
  const subject = "Sifariş Linkiniz — " + params.orderNumber;
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Ödənişə yönləndirilirsiniz</h2>" +
    "<p>Sifariş <strong>" + params.orderNumber + "</strong> üçün ödəniş səhifəsinə yönləndirilirsiniz.</p>" +
    "<p>Bu linki saxlayın — ödəniş tamamlanmasa belə, sifarişinizin statusunu yoxlamaq və ya ödənişi yenidən cəhd etmək üçün bundan istifadə edə bilərsiniz:</p>" +
    "<p><a href=\"" + params.resultUrl + "\" style=\"display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;\">Sifarişimə Bax</a></p>" +
    "<p style=\"color: #666; font-size: 12px;\">" + params.resultUrl + "</p>" +
    "</div>";
  return { subject, html };
}

export function adminNewOrderEmail(params: {
  orderNumber: string;
  total: string;
  customerEmail: string;
}): { subject: string; html: string } {
  const subject = "Yeni Sifariş — " + params.orderNumber;
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Yeni Sifariş Daxil Oldu</h2>" +
    "<p><strong>Sifariş nömrəsi:</strong> " + params.orderNumber + "</p>" +
    "<p><strong>Müştəri:</strong> " + params.customerEmail + "</p>" +
    "<p><strong>Cəmi:</strong> " + params.total + "</p>" +
    "</div>";
  return { subject, html };
}
