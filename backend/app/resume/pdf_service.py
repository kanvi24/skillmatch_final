import logging
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)


class PDFService:
    @staticmethod
    def html_to_pdf(html_content: str) -> bytes:
        """
        Converts an HTML string into a PDF byte stream using headless Playwright Chromium.
        Supports full modern CSS: flexbox, grid, CSS variables, Google Fonts, gradients.
        """
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",  # Crucial for Docker containers
                        "--disable-gpu"             # Reduces memory usage
                    ]
                )
                page = browser.new_page()
                page.set_content(html_content, wait_until="networkidle")

                # Wait for fonts and styles to fully load
                try:
                    page.wait_for_load_state("networkidle", timeout=5000)
                except Exception:
                    pass

                pdf_bytes = page.pdf(
                    format="A4",
                    margin={
                        "top": "15mm",
                        "right": "15mm",
                        "bottom": "15mm",
                        "left": "15mm",
                    },
                    print_background=True,
                )
                browser.close()
                return pdf_bytes

        except Exception as e:
            logger.error(f"Playwright PDF generation failed: {e}")
            return PDFService._fallback_pdf(str(e))

    @staticmethod
    def _fallback_pdf(error_msg: str) -> bytes:
        """
        Returns a minimal valid PDF with an error message if Playwright fails.
        """
        sanitized = error_msg.replace("(", "").replace(")", "").encode("ascii", errors="ignore")[:120]
        pdf = (
            b"%PDF-1.4\n"
            b"1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n"
            b"2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj\n"
            b"3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>> endobj\n"
            b"4 0 obj <</Length 180>> stream\n"
            b"BT\n/F1 13 Tf\n50 780 Td\n(SkillMatch - PDF Generation Error) Tj\n"
            b"0 -30 Td\n(Playwright encountered an error:) Tj\n"
            b"0 -20 Td\n(" + sanitized + b") Tj\n"
            b"0 -30 Td\n(Please try again or contact support.) Tj\nET\n"
            b"endstream\nendobj\n"
            b"5 0 obj <</Type/Font/Subtype/Type1/BaseFont/Helvetica>> endobj\n"
            b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n"
            b"0000000111 00000 n\n0000000212 00000 n\n0000000442 00000 n\n"
            b"trailer <</Size 6/Root 1 0 R>>\n"
            b"startxref\n510\n%%EOF"
        )
        return pdf
