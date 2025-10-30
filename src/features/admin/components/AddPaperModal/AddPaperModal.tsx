import { useState } from "react";
import Input from "@/components/common/Input/Input";
import Modal from "@/components/common/Modal/Modal";
import { type ResearchPaper } from "@/types";
import style from "./AddPaperModal.module.css";

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddPaperModal({ isOpen, onClose }: ResearchModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [abstract, setAbstract] = useState("");
  const [department, setDepartment] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new paper object
    const newPaper: Omit<ResearchPaper, "paperId" | "archived" | "fileUrl"> = {
      title,
      authorName: author,
      abstractText: abstract,
      department: { departmentId: 1, departmentName: department },
      submissionDate,
    };

    console.log("New paper to be added:", newPaper);

    // Reset form
    setTitle("");
    setAuthor("");
    setAbstract("");
    setDepartment("");
    setSubmissionDate("");

    // Close modal
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // File handling would occur here in the real implementation
    console.log("File selected:", e.target.files?.[0]?.name);
  };

  return (
    <Modal className={style.modal} isOpen={isOpen} onClose={onClose}>
      <div className={style.modalContent}>
        <h2 className={style.modalTitle}>Add New Research Paper</h2>
        <form className={style.form} onSubmit={handleSubmit}>
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

          <div className={style.formGroup}>
            <label htmlFor="department" className={style.label}>
              Department *
            </label>
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
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
            </select>
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
            <label htmlFor="file" className={style.label}>
              Upload File *
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

          <div className={style.modalActions}>
            <button type="button" className={style.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={style.submitButton}>
              Add Paper
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddPaperModal;
