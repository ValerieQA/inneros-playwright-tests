# InnerOS Playwright Tests

Автотесты на Playwright (Python + pytest) для сайта https://www.inneros.online и учебные тесты.
Учебный проект курса Coursera по Playwright.

## Что внутри
| Папка / файл | Что это |
|---|---|
| `pages/` | Page Objects (локаторы и действия страниц) |
| `tests/test_inneros_smoke.py` | smoke-тесты живого сайта: главная, переходы на Clarity Lab и Never Blank |
| `tests/practice/` | учебная страница «10 строк + Submit» и тесты на роли, цепочки, фильтры, `.nth()`, автоожидание |
| `.github/workflows/playwright.yml` | CI: тесты на каждый push / pull request в `main`, HTML-отчёт и trace как артефакт |
| `.github/workflows/playwright-docker.yml` + `Dockerfile` | те же тесты в Docker (ручной запуск) |

## Запуск локально
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
pytest                    # все тесты
pytest -m smoke           # только живой сайт
pytest -m practice        # только учебные
pytest --headed           # с окном браузера
```
Отчёт: `pytest --html=report.html --self-contained-html`.
Упавший тест оставляет скриншот, видео и trace в `test-results/`; открыть trace: `playwright show-trace <путь>/trace.zip`.

## CI
Результаты: вкладка **Actions** → запуск → **Artifacts** → `playwright-report`.
