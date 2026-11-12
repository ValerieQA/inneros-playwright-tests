# Учебные тесты: 10 строк «поле + Submit» на локальной странице rows.html.
# Запуск: pytest -m practice   (с окном браузера: pytest -m practice --headed)
from pathlib import Path
import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.practice

PAGE = (Path(__file__).parent / "rows.html").resolve().as_uri()


@pytest.fixture(autouse=True)
def open_page(page: Page):
    page.goto(PAGE)


def test_0_so_nelzya_strict_mode(page: Page):
    """Кнопок Submit — 10. Playwright НЕ нажимает «какую-нибудь», он падает."""
    with pytest.raises(Exception, match="strict mode violation"):
        page.get_by_role("button", name="Submit").click(timeout=2000)


def test_1_rol_i_podpis(page: Page):
    """1. РОЛЬ: поле находим по подписи — подпись уникальна («Виза»)."""
    page.get_by_role("textbox", name="Виза").fill("VISA-123")


def test_2_cepochka(page: Page):
    """2. ЦЕПОЧКА: строка, где есть «Виза» → внутри неё кнопка Submit."""
    row = page.locator(".row").filter(has_text="Виза")
    row.get_by_role("textbox").fill("VISA-123")
    row.get_by_role("button", name="Submit").click()
    # 5. АВТООЖИДАНИЕ: статус появится через 1 сек — expect подождёт сам
    expect(row.locator(".status")).to_have_text("Отправлено: VISA-123")


def test_3_ot_polya_k_ego_knopke(page: Page):
    """2б. ЦЕПОЧКА от поля: нашли поле → поднялись к его строке → кнопка рядом."""
    field = page.get_by_role("textbox", name="Страховка")
    field.fill("POLICY-777")
    row = page.locator(".row").filter(has=field)        # строка, в которой это поле
    row.get_by_role("button", name="Submit").click()
    expect(row.locator(".status")).to_have_text("Отправлено: POLICY-777")


def test_4_filtr_po_sostoyaniyu(page: Page):
    """3. ФИЛЬТР: только строки, где кнопка активна (без «заблокировано»)."""
    active_rows = page.locator(".row").filter(has_not_text="заблокировано")
    expect(active_rows).to_have_count(9)
    expect(page.locator(".row").filter(has_text="Приглашение").get_by_role("button")).to_be_disabled()


def test_5_nth_po_nomeru(page: Page):
    """4. .nth(): когда важен именно порядок — «первая строка», «последняя»."""
    rows = page.locator(".row")
    expect(rows).to_have_count(10)
    expect(rows.first).to_contain_text("Паспорт")
    expect(rows.nth(2)).to_contain_text("Страховка")   # счёт с нуля: 0, 1, 2
    expect(rows.last).to_contain_text("Другое")
