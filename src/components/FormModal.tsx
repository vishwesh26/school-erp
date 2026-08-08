"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteLesson,
  deleteResult,
  deleteEvent,
  deleteAnnouncement,
  deleteParent,
  deleteAssignment,
  deleteLibrarian,
  deleteBook,
  deleteAdmissionInquiry,
} from "@/lib/actions";
import { deleteFeeCategory } from "@/lib/accountantActions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap: { [key: string]: (currentState: any, data: FormData) => Promise<{ success: boolean; error: boolean }> } = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject, // TODO: Implement deleteAttendance
  event: deleteEvent,
  announcement: deleteAnnouncement,
  librarian: deleteLibrarian,
  book: deleteBook,
  feeCategory: deleteFeeCategory,
  inquiry: deleteAdmissionInquiry,
};

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TransferStudentForm = dynamic(() => import("./forms/TransferStudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const LibrarianForm = dynamic(() => import("./forms/LibrarianForm"), {
  loading: () => <h1>Loading...</h1>,
});
const BookForm = dynamic(() => import("./forms/BookForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FeeCategoryForm = dynamic(() => import("./forms/FeeCategoryForm"), {
  loading: () => <h1>Loading...</h1>,
});
const InquiryForm = dynamic(() => import("./forms/InquiryForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update" | "transfer",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  librarian: (setOpen, type, data, relatedData) => (
    <LibrarianForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  book: (setOpen, type, data, relatedData) => (
    <BookForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    type === "transfer" ? (
      <TransferStudentForm
        type={type as "transfer"}
        data={data}
        setOpen={setOpen}
        relatedData={relatedData}
      />
    ) : (
      <StudentForm
        type={type as "create" | "update"}
        data={data}
        setOpen={setOpen}
        relatedData={relatedData}
      />
    )
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  feeCategory: (setOpen, type, data, relatedData) => (
    <FeeCategoryForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  inquiry: (setOpen, type, data, relatedData) => (
    <InquiryForm
      type={type as "create" | "update"}
      data={data}
      setOpen={setOpen}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="text | number" name="id" value={id} hidden />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : (type === "create" || type === "update" || type === "transfer") && forms[table] ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  const renderIcon = () => {
    if (type === "create") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    }
    if (type === "update") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    }
    if (type === "transfer") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      );
    }
    if (type === "delete") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    }
    return null;
  };

  const getButtonClass = () => {
    if (type === "create") {
      return "w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-sm hover:scale-105 active:scale-95";
    }
    if (type === "update") {
      return "w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200/70 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95";
    }
    if (type === "transfer") {
      return "w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-200/70 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95";
    }
    if (type === "delete") {
      return "w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/70 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95";
    }
    return "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700";
  };

  return (
    <>
      <button
        type="button"
        className={getButtonClass()}
        onClick={() => setOpen(true)}
        title={type === 'transfer' ? 'Transfer Class' : `${type.charAt(0).toUpperCase() + type.slice(1)} ${table}`}
      >
        {renderIcon()}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl relative w-full max-w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <Form />
            <div
              className="absolute top-6 right-6 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all group"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={16} height={16} className="opacity-60 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
