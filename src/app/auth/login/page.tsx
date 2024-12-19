export default async function LoginPage() {
  return (
    <div className="auth-basic-wrapper d-flex align-items-center justify-content-center">
      <div className="container-fluid my-5 my-lg-0">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4 mx-auto">
            <div className="card rounded-4 mb-0 border-top border-4 border-primary">
              <div className="card-body p-5">
                <img
                  src="/assets/images/logo1.png"
                  className="mb-4"
                  width={145}
                />
                <h4 className="fw-bold">PANJI JAYA</h4>
                <p className="mb-0">ENTERPRISE MANAGEMENT SYSTEM</p>
                <div className="form-body my-5">
                  <form className="row g-3">
                    <div className="col-12">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="form-control"
                        placeholder="Enter Username"
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <div className="input-group" id="show_hide_password">
                        <input
                          id="password"
                          type="password"
                          className="form-control border-end-0"
                          placeholder="Enter Password"
                        />
                        <a
                          href="javascript:;"
                          className="input-group-text bg-transparent"
                        >
                          <i className="bi bi-eye-slash-fill" />
                        </a>
                      </div>
                    </div>
                    <div className="col-md-6"></div>
                    <div className="col-md-6 text-end">
                      <a href="auth-basic-forgot-password.html">
                        Forgot Password ?
                      </a>
                    </div>
                    <hr className="mt-4" />
                    <div className="col-12 mt-4">
                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                          Login
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*end row*/}
      </div>
    </div>
  );
}
