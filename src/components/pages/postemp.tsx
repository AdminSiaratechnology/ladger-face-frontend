return (
  <div className="custom-container pt-2 space-y-3 px-2 sm:px-4">

    {/* BASIC INFO */}
    <div className="bg-white border rounded-lg px-3 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Stock Group</Label>
          <Input value={selectedGroupNames} disabled className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Price Level</Label>
          <Input value={priceLevel} disabled className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Applicable From</Label>
          <Input value={applicableFrom} disabled className="h-8 text-sm" />
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[900px] border border-gray-300 border-collapse w-full">

          {/* HEADER */}
          <TableHeader className="bg-gradient-to-r from-teal-50 to-emerald-50">
            <TableRow>
              <TableHead className="border px-2 py-2 text-xs w-[60px] text-center">
                #
              </TableHead>
              <TableHead className="border px-2 py-2 text-xs min-w-[200px]">
                Item
              </TableHead>

              <TableHead colSpan={2} className="border px-2 py-2 text-xs text-center">
                <div className="flex flex-col items-center">
                  <span>Quantities</span>
                  <div className="flex justify-between w-full px-6 mt-1">
                    <span className="text-[11px]">From</span>
                    <span className="text-[11px]">Less Than</span>
                  </div>
                </div>
              </TableHead>

              <TableHead className="border px-2 py-2 text-xs text-center min-w-[120px]">
                Rate
              </TableHead>
              <TableHead className="border px-2 py-2 text-xs text-center min-w-[120px]">
                Discount
              </TableHead>
              <TableHead className="border px-2 py-2 text-xs text-center min-w-[80px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-teal-600 animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.id} className="bg-white">

                  <TableCell className="border text-center text-sm">
                    {getSerialNo(index) || ""}
                  </TableCell>

                  <TableCell className="border text-sm font-medium">
                    {getSerialNo(index) ? row.name : ""}
                  </TableCell>

                  {["fromQty", "lessThanQty", "rate"].map((f, i) => (
                    <TableCell key={f} className="border">
                      <Input
                        ref={(el) => (inputRefs.current[index * 4 + i] = el)}
                        value={row[f]}
                        readOnly={f === "fromQty"}
                        className={`${inputCls} h-8 text-sm ${
                          f === "fromQty"
                            ? "bg-gray-100 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onChange={(e) =>
                          updateRow(index, f, sanitizeNumber(e.target.value))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            focusNextEditable(index * 4 + i);
                          }
                        }}
                      />
                    </TableCell>
                  ))}

                  <TableCell className="border">
                    <Input
                      ref={(el) => (inputRefs.current[index * 4 + 3] = el)}
                      value={`${row.discount}%`}
                      className={`${inputCls} h-8 text-sm`}
                      onChange={(e) =>
                        updateRow(
                          index,
                          "discount",
                          sanitizeNumber(e.target.value.replace("%", ""))
                        )
                      }
                    />
                  </TableCell>

                  <TableCell className="border text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </Button>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </div>
    </div>

    {/* ACTION BAR */}
    <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/price-list")}
        className="w-full sm:w-auto"
      >
        ← Back
      </Button>

      <Button
        className="bg-teal-600 hover:bg-teal-700 text-white px-7 py-3 rounded-full w-full sm:w-auto"
        onClick={saveCurrentPage}
      >
        Set Price List
      </Button>
    </div>

    {/* PAGINATION */}
    <div className="w-full bg-white rounded-xl shadow-sm px-3 py-2 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border">
      <span className="text-xs sm:text-sm text-gray-600">
        Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total}
      </span>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={goPrev}>
          ‹
        </Button>

        <span className="text-sm">
          {page} / {totalPages}
        </span>

        <Button variant="outline" size="sm" disabled={!hasMore} onClick={goNext}>
          ›
        </Button>
      </div>
    </div>

  </div>
);
