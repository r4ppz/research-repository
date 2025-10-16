import clsx from "clsx";
import { useState } from "react";
import Button from "@/components/common/Button/Button";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [tableActive, setTableActive] = useState(false);

  return (
    <div className={clsx(style.page, tableActive && style.tableActive)}>
      <Header />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Research Paper Requests</h1>

        <section
          className={style.tableSection}
          onMouseEnter={() => {
            setTableActive(true);
          }}
          onMouseLeave={() => {
            setTableActive(false);
          }}
          onFocus={() => {
            setTableActive(true);
          }}
          onBlur={() => {
            setTableActive(false);
          }}
        >
          <table className={style.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {MOCK_REQUESTS.map((request) => (
                <tr key={request.requestId}>
                  <td>
                    {/* NOTE: make it clickable or add new view button? i dont fucking know*/}
                    <h3 className={style.paperTitle}>{request.paper.title}</h3>
                  </td>
                  <td>{request.paper.authorName}</td>
                  <td className={style.statusCell} data-status={request.status}>
                    {request.status}
                  </td>
                  <td>{request.requestDate}</td>
                  <td className={style.actionCell}>
                    <Button
                      variant="primary"
                      className={style.downloadButton}
                      disabled={request.status !== "ACCEPTED"}
                      onClick={
                        request.status === "ACCEPTED"
                          ? () => {
                              console.log("Download");
                            }
                          : () => {}
                      }
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RequestPage;
