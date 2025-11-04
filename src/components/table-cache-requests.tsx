import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnDef,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

import { useEffect, useMemo, useState } from "react";
import DeleteConfirmation from "./delete-confirmation";
import { Button } from "@headlessui/react";
import { TableSearch } from "./table-search";
import { renderHTMLElement } from "astro/runtime/server/index.js";
import Toggle from "./toggle";

const columnHelper = createColumnHelper();

const fallbackData = [
  {
    id: "1",
    title: "Record 1",
  },
];

const originPath = `/api/v1/admin/cache-requests`;

function TableCacheRequests({ tableConfig }) {
  // debugger;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [kvCount, setKvCount] = useState(0);
  const [cacheRequestCount, setCacheRequestCount] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdOn", desc: true },
  ]); // can set initial sorting state here
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; url: string } | null>(null);
  const [reload, setReload] = useState(false);
  const [columnFilters, setColumnFilters] = useState([
    { id: "url", value: "" },
  ]);

  const pageSize = 20;

  // setSorting({ id: "title", desc: true });
  // const columns = Object.entries(tableConfig.formFields).map(([key, value]) =>
  //   columnHelper.accessor(key, {
  //     header: value.header || key.charAt(0).toUpperCase() + key.slice(1),
  //     cell: (info) => truncateText(info.getValue(), 30),
  //   })
  // );
  const columns = tableConfig.formFields.map((formField) => {
    return columnHelper.accessor(formField.key, {
      header: formField.key.charAt(0).toUpperCase() + formField.key.slice(1),
      cell: (info) => {
        switch (formField.key) {
          case "id":
            return truncateText(info.getValue(), 5);
          case "url":
            return (
              <a href={info.getValue()} target="_blank">
                {info.getValue()}
              </a>
            );
          case "matchingKvRecord":
            return <Toggle isSet={info.getValue()}></Toggle>; // info.getValue() ? "Yes" : "No";
          default:
            return truncateText(info.getValue(), 60);
        }
      },
    });
  });

  const handleDeleteClick = (row, id, url) => {
    setRecordToDelete({ id, url });
    setShowDeleteConfirmation(true);
  };

  // console.log("columns-->", columns);

  function truncateText(text: string, maxLength: number): string {
    if (text) {
      if (text.length <= maxLength) {
        return text;
      }
      return text.toString().slice(0, maxLength) + "...";
    }
  }
  // console.log("columns", columns);
  // columnHelper.accessor((row) => `${row.firstName} ${row.surname}`, {
  //   id: "fullName",
  //   header: "Full Name",
  // }),
  //   columnHelper.accessor("id", {
  //     header: "Id",
  //   }),
  //   columnHelper.accessor("title", {
  //     header: "Title 2",
  //   }),
  //   columnHelper.accessor("updated_on", {
  //     header: "Last Updated",
  //   }),
  // ];

  const table = useReactTable({
    data: data ?? fallbackData,
    columns,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    console.log("loading");
    setLoading(true);

    const offset = page * pageSize;

    getData(originPath);
  }, [reload]);

  useEffect(() => {
    if (confirmDelete && recordToDelete) {
      deleteData(recordToDelete);
      console.log("record deleted");
      setConfirmDelete(false);

      // remove record from table
      window.location.href = `/admin/cache`;
    }
  }, [confirmDelete]);

  const getData = (originPath) => {
    if (originPath) {
      fetch(`${originPath}`).then(async (response) => {
        const responseData: { data: any, kvRecordsCount: number, cacheRequestsCount: number } = await response.json();
        setData(responseData.data);
        setKvCount(responseData.kvRecordsCount);
        setCacheRequestCount(responseData.cacheRequestsCount);
        setLoading(false);
      });
    }
  };

  const deleteData = ({ id, url }) => {
    if (id && url) {
      const path = `/api/v1/admin/cache-requests?id=${id}&url=${url}`;

      // const path = `/api/v1/${tableConfig.route}`;

      fetch(path, {
        method: "DELETE",
      })
        .then((res) => res.text()) // or res.json()
        .then((res) => console.log(res));
      console.log("delete record with id", id);
    }
  };

  const pagerColor = (pageNumber) => {
    return pageNumber === table.getState().pagination.pageIndex + 1
      ? "border-indigo-500 text-indigo-600"
      : "border-transparent text-gray-500 hover:text-gray-300";
  };

  if (table) {
    console.log("sorting", table.getState().sorting);
    const pageArray = Array.from(
      { length: table.getPageCount() },
      (_, i) => i + 1
    );

    return (
      <div className="bg-gray-900">
        {showDeleteConfirmation && (
          <DeleteConfirmation
            open={showDeleteConfirmation}
            setOpen={setShowDeleteConfirmation}
            setConfirmDelete={setConfirmDelete}
          />
        )}

        <div className="mx-auto">
          <div className="bg-gray-900 py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white">
                    {tableConfig.name.toUpperCase()}
                  </h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center justify-end gap-x-6">
                  <a
                    href="/api/v1/admin/purge-kv-cache-requests"
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Purge KV 
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 ml-2">
                      {kvCount}
                    </span>
                  </a>
                  <a
                    href="/api/v1/admin/purge-d1-cache-requests"
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Purge D1 Requests
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 ml-2">
                      {cacheRequestCount}
                    </span>
                  </a>

                  <button
                    type="button"
                    className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => {
                      window.location.href = `/admin/forms/${tableConfig.route}`;
                    }}
                  >
                    <PlusIcon aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-8 flow-root">
                {" "}
                <TableSearch
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                />
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => {
                          return (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100"
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <a href="#" className="group inline-flex">
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      {{
                                        asc: arrowDown(),
                                        desc: arrowUp(),
                                      }[
                                        header.column.getIsSorted() as string
                                      ] ?? null}
                                    </a>
                                  </th>

                                  // <th
                                  //   key={header.id}
                                  //   scope="col"
                                  //   className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100"
                                  // >
                                  //   <a href="#" className="group inline-flex">
                                  //     {header.isPlaceholder ? null : (
                                  //       <div
                                  //         className={
                                  //           header.column.getCanSort()
                                  //             ? "cursor-pointer"
                                  //             : ""
                                  //         }
                                  //         onClick={header.column.getToggleSortingHandler()}
                                  //         title={
                                  //           header.column.getCanSort()
                                  //             ? header.column.getNextSortingOrder() ===
                                  //               "asc"
                                  //               ? "Sort ascending"
                                  //               : header.column.getNextSortingOrder() ===
                                  //                   "desc"
                                  //                 ? "Sort descending"
                                  //                 : "Clear sort"
                                  //             : undefined
                                  //         }
                                  //       >
                                  //         {flexRender(
                                  //           header.column.columnDef.header,
                                  //           header.getContext()
                                  //         )}
                                  //         {{
                                  //           asc: arrowDown(),
                                  //           desc: arrowUp(),
                                  //         }[
                                  //           header.column.getIsSorted() as string
                                  //         ] ?? null}
                                  //       </div>
                                  //     )}
                                  //   </a>
                                  // </th>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => {
                          return (
                            <tr key={row.id}>
                              {row.getVisibleCells().map((cell) => {
                                return (
                                  <td
                                    key={cell.id}
                                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                );
                              })}
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <a
                                  href={`/admin/forms/${tableConfig.route}/${row.getValue("id")}`}
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  Edit
                                </a>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <button
                                  onClick={() =>
                                    handleDeleteClick(
                                      row,
                                      row.getValue("id"),
                                      row.getValue("url")
                                    )
                                  }
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 mt-4">
              <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
                <div className="-mt-px flex w-0 flex-1">
                  <Button
                    onClick={() => {
                      table.previousPage();
                    }}
                    disabled={table.getCanPreviousPage()}
                    className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-300"
                  >
                    <ArrowLongLeftIcon
                      aria-hidden="true"
                      className="mr-3 h-5 w-5 text-gray-400"
                    />
                    Previous
                  </Button>
                </div>
                <div className="hidden md:-mt-px md:flex">
                  {pageArray.map((pageNumber) => (
                    <Button
                      onClick={() => table.setPageIndex(pageNumber - 1)}
                      className={
                        "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium hover:border-gray-300 hover:text-gray-300" +
                        pagerColor(pageNumber)
                      }
                    >
                      {pageNumber}
                    </Button>
                  ))}

                  {/* TODO: split page buttons when there are many pages */}
                  {/* <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                    ...
                  </span> */}
                </div>
                <div className="-mt-px flex w-0 flex-1 justify-end">
                  <Button
                    onClick={() => {
                      table.nextPage();
                    }}
                    disabled={table.getCanNextPage()}
                    className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-300"
                  >
                    Next
                    <ArrowLongRightIcon
                      aria-hidden="true"
                      className="ml-3 h-5 w-5 text-gray-400"
                    />
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    <div>no data yet</div>;
  }
}

const arrowDown = () => {
  return (
    <span className="ml-2 flex-none rounded bg-gray-800 text-gray-200 group-hover:bg-gray-700">
      <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
    </span>
  );
};

const arrowUp = () => {
  return (
    <span className="ml-2 flex-none rounded bg-gray-800 text-gray-200 group-hover:bg-gray-700">
      <ChevronUpIcon aria-hidden="true" className="h-5 w-5" />
    </span>
  );
};

export default TableCacheRequests;
