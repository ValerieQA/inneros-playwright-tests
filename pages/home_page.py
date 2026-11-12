"""Page Object главной страницы InnerOS: локаторы и действия в одном месте."""
import re
from playwright.sync_api import Page, Locator


class HomePage:
    URL = "/"

    def __init__(self, page: Page):
        self.page = page

    def open(self) -> None:
        self.page.goto(self.URL)

    def explore_link(self, product: str) -> Locator:
        # Wix часто держит скрытые дубли элементов (мобильная версия) → берём только видимые
        return (self.page.get_by_role("link", name=re.compile(f"Explore {product}", re.I))
                .filter(visible=True).first)

    def footer_copyright(self) -> Locator:
        return self.page.get_by_text(re.compile(r"©\s*\d{4}\s*InnerOS", re.I)).filter(visible=True).first
