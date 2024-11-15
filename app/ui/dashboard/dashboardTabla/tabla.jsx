import { FaPencilAlt } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import styles from "./tabla.module.css";

export default function TablaDashboard() {
  return (
    <div className={styles.contenedor}>
      <h4>Todos los usuarios</h4>
      <div className={styles.cont_table}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>ID</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>RATING</th>
              <th>ORDER</th>
              <th>SALES</th>
              <th>OTROS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>asdsad</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasdsa</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>asdasd</td>
              <td>
                <div className={styles.cont_actions}>
                  <button>
                    <FaPencilAlt />
                  </button>
                  <button>
                    <IoMdTrash />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.paginacion}>
          <p>
            Mostrando <span>10</span> de <span>20</span> usuarios
          </p>
          <Stack spacing={2}>
            <Pagination
              count={10}
              showFirstButton
              showLastButton
              color="primary"
            />
          </Stack>
        </div>
      </div>
    </div>
  );
}
