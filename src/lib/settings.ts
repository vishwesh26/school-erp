export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/librarian(.*)": ["librarian", "admin"],
  "/reception(.*)": ["reception", "admin"],
  "/accountant(.*)": ["accountant", "admin"],
  "/list/librarians": ["admin"],
  "/list/inquiries": ["admin", "reception"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher", "accountant"],
  "/list/parents": ["admin", "teacher", "accountant"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "teacher", "student", "parent"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
  "/list/finance": ["admin", "teacher", "accountant"],
  "/list/finance/categories": ["admin", "teacher", "accountant"],
  "/list/promotion": ["admin"],
  "/admin/documents": ["admin"],
  "/list/lessons": ["admin", "teacher", "student", "parent", "accountant"],
  "/profile": ["admin", "teacher", "student", "parent", "accountant"],
  "/settings": ["admin", "teacher", "student", "parent", "accountant"],
};