import Button from "@/components/common/Button/Button";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import style from "./RequestPage.module.css";

function RequestPage() {
  return (
    <div className={style.page}>
      <Header />

      <main className={style.main}>
        <section className={style.titleSection}>
          <h1 className={style.titleHeader}>Research Paper Requests</h1>
        </section>

        <section className={style.tableSection}>
          <table className={style.Table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {MOCK_REQUESTS.map((request) => (
                <tr key={request.requestId}>
                  <td>{request.paper.title}</td>
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
                              console.log("Test Only");
                            }
                          : () => {
                              console.log("");
                            }
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
