"""Read back polished exports with Excel-aware types and package relationships."""
from pathlib import Path
import sys
from openpyxl import load_workbook

root = Path(__file__).resolve().parent.parent / "output" / "workbooks"
for filename, count in [("Yarmouk University-Partnerships.xlsx", 4), (sys.argv[1] if len(sys.argv)>1 else "Yarmouk University-Detailed-Records.xlsx", 7)]:
    workbook = load_workbook(root / filename)
    assert len(workbook.worksheets) == count
    assert not {"Read me", "Objectives", "Ticket messages", "Conversations"}.intersection(workbook.sheetnames)
    assert workbook.worksheets[0].title == "Partnerships"
    assert workbook["Partnerships"]["D6"].value == 0, "Zero must not become a blank"
    assert workbook["Partnerships"]["D6"].number_format == "#,##0"
    assert workbook["Placements"]["G6"].is_date, "Dates remain typed and sortable"
    assert workbook["Placements"]["G6"].number_format == "dd mmm yyyy"
    for sheet in workbook:
        assert sheet.sheet_view.showGridLines is False
        assert sheet.freeze_panes
        assert sheet.print_area
        assert sheet.print_title_rows == "$5:$5"
        assert sheet.row_dimensions[5].height >= 48
        assert sheet["A2"].font.name == "Arial"
        for table in sheet.tables.values():
            assert [col.name for col in table.tableColumns] == [cell.value for cell in sheet[5]]
        for row in sheet:
            assert all(cell.data_type != "e" for cell in row)
    print(f"PASS: {filename}: native tables, types, zero values, dates, freeze panes, print layout and typography.")
