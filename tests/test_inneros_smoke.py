"""Smoke-тесты живого сайта https://www.inneros.online (адрес задан в pytest.ini → base_url)."""
import re
import pytest
from playwright.sync_api import Page, expect
from pages.home_page import HomePage

pytestmark = pytest.mark.smoke


def test_home_page_opens(page: Page):
    home = HomePage(page)
    home.open()
    expect(page).to_have_title(re.compile(r"Home \| InnerOS"))
    expect(home.footer_copyright()).to_be_visible()


@pytest.mark.parametrize("product, path", [
    ("Clarity Lab", "/clarity-lab"),
    ("Never Blank", "/never-blank"),
])
def test_product_link_opens_product_page(page: Page, product: str, path: str):
    home = HomePage(page)
    home.open()
    # ссылки «Explore … →» открывают страницу продукта в НОВОЙ вкладке → ловим её через expect_popup
    with page.expect_popup() as popup_info:
        home.explore_link(product).click()
    product_page = popup_info.value
    expect(product_page).to_have_url(re.compile(re.escape(path) + r"/?$"))
    expect(product_page).to_have_title(re.compile(re.escape(product) + r" \| InnerOS"))
