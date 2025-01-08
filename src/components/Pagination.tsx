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
    <>
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a className="page-link" href="#" onClick={() => setCurrentPage(1)}>
              First
            </a>
          </li>
          {pageNumbers}
          <li className="page-item">
            <a
              className="page-link"
              href="#"
              onClick={() => setCurrentPage(totalPage)}
            >
              Last
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Pagination;
