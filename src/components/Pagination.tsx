type PaginationProps = {
  currentPage: number;
  totalPage: number;
  maxPagination: number;
  setCurrentPage: (page: number) => void;
};

const Pagination = (props: PaginationProps) => {
  const { currentPage, setCurrentPage, totalPage, maxPagination } = props;

  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagination / 2));

  for (
    let i = startPage;
    i <= Math.min(totalPage, startPage + maxPagination - 1);
    i++
  ) {
    pageNumbers.push(
      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
        <a className="page-link" href="#" onClick={() => setCurrentPage(i)}>
          {i}
        </a>
      </li>
    );
  }

  if (totalPage > maxPagination) {
    // Add an ellipsis for additional pages
    if (startPage > 1) {
      pageNumbers.unshift(
        <li key={1} className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    if (startPage + maxPagination - 1 < totalPage) {
      pageNumbers.push(
        <li key={totalPage} className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-gutter pagination-primary justify-content-end mt-3 mb-0">
        <li className={`page-item page-indicator ${currentPage === 1 ? "disabled" : ""}`}>
          <a className="page-link" href="#" onClick={() => setCurrentPage(1)}>
            <i className="fas fa-angle-double-left"></i> First
          </a>
        </li>
        {pageNumbers}
        <li className="page-item page-indicator">
          <a
            className="page-link"
            href="#"
            onClick={() => setCurrentPage(totalPage)}
          >
            Last <i className="fas fa-angle-double-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
