"""Polish a Yarmouk University XLSX export with openpyxl, preserving its records and formulas.

Usage: python tools/clean-workbook.py input.xlsx output.xlsx
"""
from argparse import ArgumentParser
from datetime import date, datetime
from pathlib import Path
from textwrap import wrap

from openpyxl import load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.page import PageMargins


def lines(value, width):
    return sum(max(1, len(wrap(line, max(6, int(width)), break_long_words=True)))
               for line in str(value or "").split("\n"))


def records(book):
    return {sheet.title: {(cell.coordinate): (cell.value, cell.data_type)
                          for row in sheet for cell in row if cell.value not in (None, "")}
            for sheet in book}


def clean(source, destination):
    if source.resolve() == destination.resolve():
        raise ValueError("Choose a separate output path to preserve the original export.")
    book = load_workbook(source, keep_links=True)
    original = records(book)
    navy, ink, muted = "193654", "172C48", "52647C"
    rule = Side(style="thin", color="E5EBF4")
    for index, sheet in enumerate(book):
        sheet.sheet_view.showGridLines = False
        sheet.sheet_view.zoomScale = 90
        sheet.sheet_properties.tabColor = "2455D6" if index == 0 else "A8BCE9"
        last = sheet.max_column
        total_width = sum(sheet.column_dimensions[get_column_letter(c)].width for c in range(1, last + 1))
        sheet.row_dimensions[1].height = 12
        sheet.row_dimensions[2].height = 36
        for row in (3, 4):
            value = sheet.cell(row, 1).value
            sheet.row_dimensions[row].height = max(24, lines(value, total_width - 6) * 14 + 10) if value else 12
        for row in sheet:
            for cell in row:
                cell.font = Font(name="Arial", size=11, color=ink)
                cell.alignment = Alignment(vertical="center", wrap_text=True)
        sheet["A2"].font = Font(name="Arial", size=17, bold=True, color=navy)
        sheet["A2"].alignment = Alignment(vertical="center")
        for c in range(1, last + 1):
            sheet.cell(2, c).border = Border(bottom=Side(style="thin", color="A8BCE9"))
        for row in (3, 4):
            sheet.cell(row, 1).font = Font(name="Arial", size=10, color=muted)
        header_height = 48
        for cell in sheet[5]:
            cell.font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor=navy)
            cell.border = Border(right=Side(style="thin", color="FFFFFF"))
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            width = sheet.column_dimensions[cell.column_letter].width
            header_height = max(header_height, lines(cell.value, width - 4) * 15 + 16)
        sheet.row_dimensions[5].height = header_height
        for row in sheet.iter_rows(min_row=6):
            height = 32
            for cell in row:
                cell.fill = PatternFill("solid", fgColor="FFFFFF" if cell.row % 2 == 0 else "F6F8FC")
                cell.border = Border(bottom=rule)
                numeric = isinstance(cell.value, (int, float)) and not isinstance(cell.value, bool)
                dated = isinstance(cell.value, (date, datetime))
                cell.alignment = Alignment(horizontal="right" if numeric or dated else "left",
                                           vertical="center", wrap_text=True, indent=1)
                if dated:
                    cell.number_format = "dd mmm yyyy"
                elif numeric and "%" not in cell.number_format:
                    cell.number_format = "#,##0" if float(cell.value).is_integer() else "#,##0.00"
                elif cell.data_type == "s":
                    cell.number_format = "@"
                if cell.value is not None and not numeric and not dated:
                    width = sheet.column_dimensions[cell.column_letter].width
                    height = max(height, lines(cell.value, width - 4) * 15 + 14)
            sheet.row_dimensions[row[0].row].height = min(409, height)
        sheet.print_options.horizontalCentered = False
        sheet.print_area = f"A1:{get_column_letter(last)}{sheet.max_row}"
        sheet.print_title_rows = "5:5"
        sheet.page_setup.orientation = "landscape"
        sheet.page_setup.paperSize = sheet.PAPERSIZE_A3 if total_width > 170 else sheet.PAPERSIZE_A4
        sheet.page_setup.fitToWidth = 1
        sheet.page_setup.fitToHeight = 0
        sheet.sheet_properties.pageSetUpPr.fitToPage = True
        sheet.page_margins = PageMargins(left=.3, right=.3, top=.5, bottom=.5, header=.2, footer=.2)
        sheet.oddFooter.left.text = "Yarmouk University"
        sheet.oddFooter.right.text = "Page &P of &N"
    destination.parent.mkdir(parents=True, exist_ok=True)
    book.save(destination)
    reopened = load_workbook(destination, keep_links=True)
    assert records(reopened) == original, "Formatting changed source records or formulas"
    for sheet in reopened:
        assert sheet.sheet_view.showGridLines is False
        assert sheet.print_title_rows == "$5:$5"
        assert sheet.freeze_panes is not None
        assert not any(cell.data_type == "e" for row in sheet for cell in row), "Workbook has an Excel error"
    print(f"Validated {len(reopened.worksheets)} sheets; all records and formulas preserved: {destination}")


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    clean(args.source, args.destination)
