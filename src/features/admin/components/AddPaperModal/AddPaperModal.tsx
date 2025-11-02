import { Upload } from "lucide-react";
import { FormEvent, useState } from "react";
import Input from "@/components/common/Input/Input";
import Modal from "@/components/common/Modal/Modal";
import { MOCK_DEPARTMENTS } from "@/mocks/filterMocks";
import { type ResearchPaper } from "@/types";
import style from "./AddPaperModal.module.css";

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "STUDENT" | "DEPARTMENT_ADMIN" | "SUPER_ADMIN";
  userDepartment?: { departmentId: number; departmentName: string } | null;
}

function AddPaperModal({ isOpen, onClose, userRole, userDepartment }: ResearchModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [abstract, setAbstract] = useState("");

  // For department admins, pre-populate the department field with their own department
  const [department, setDepartment] = useState(
    userRole === "DEPARTMENT_ADMIN" && userDepartment ? userDepartment.departmentName : "",
  );

  const [submissionDate, setSubmissionDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Create a new paper object
    const newPaper: Omit<ResearchPaper, "paperId" | "archived" | "fileUrl"> = {
      title,
      authorName: author,
      abstractText: abstract,
      department: {
        departmentId:
          userRole === "DEPARTMENT_ADMIN" && userDepartment ? userDepartment.departmentId : 1,
        departmentName: department,
      },
      submissionDate,
    };

    console.log("New paper to be added:", newPaper);

    // Reset form
    setTitle("");
    setAuthor("");
    setAbstract("");
    setDepartment(
      userRole === "DEPARTMENT_ADMIN" && userDepartment ? userDepartment.departmentName : "",
    );
    setSubmissionDate("");
    setSelectedFile(null);

    // Close modal
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  return (
    <Modal className={style.modal} isOpen={isOpen} onClose={onClose}>
      <div className={style.modalContent}>
        <h2 className={style.modalTitle}>Add New Research Paper</h2>
        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.formContainer}>
            <div className={style.formRow}>
              <div className={style.formLeftSide}>
                <div className={style.formGroup}>
                  <label htmlFor="title" className={style.label}>
                    Paper Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter paper title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className={style.formGroup}>
                  <label htmlFor="author" className={style.label}>
                    Author Name *
                  </label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="Enter author name"
                    value={author}
                    onChange={(e) => {
                      setAuthor(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className={style.formGroup}>
                  <label htmlFor="submissionDate" className={style.label}>
                    Submission Date *
                  </label>
                  <Input
                    id="submissionDate"
                    name="submissionDate"
                    type="date"
                    value={submissionDate}
                    onChange={(e) => {
                      setSubmissionDate(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className={style.formGroup}>
                  <label htmlFor="department" className={style.label}>
                    Department *
                  </label>
                  {userRole === "DEPARTMENT_ADMIN" ? (
                    <Input
                      id="department"
                      name="department"
                      value={department}
                      readOnly
                      disabled
                      placeholder="Your department"
                    />
                  ) : (
                    <select
                      id="department"
                      name="department"
                      className={style.select}
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select Department</option>
                      {MOCK_DEPARTMENTS.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentName}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className={style.formRightSide}>
                <div className={style.formGroup}>
                  <label htmlFor="abstract" className={style.label}>
                    Abstract *
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    placeholder="Enter paper abstract"
                    className={style.textarea}
                    value={abstract}
                    onChange={(e) => {
                      setAbstract(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className={style.fileUploadContainer}>
                  <label htmlFor="file" className={style.label}>
                    Upload File *
                  </label>
                  <label htmlFor="file" className={style.fileInputLabel}>
                    <Upload size={24} />
                    <span>Click to upload or drag and drop</span>
                    <span className={style.fileInputNote}>PDF, DOC, DOCX (Max 20MB)</span>
                    {selectedFile && <span className={style.fileName}>{selectedFile.name}</span>}
                  </label>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className={style.fileInput}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={style.modalActions}>
              <button type="button" className={style.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={style.submitButton}>
                Add Paper
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddPaperModal;
