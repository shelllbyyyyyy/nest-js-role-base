export enum STATUS {
  OK = 'OK',
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  NO_CONTENT = 'NO CONTENT',
  BAD_REQUEST = 'BAD REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL SERVER ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE UNAVAILABLE',
}

export const getStatus = (statusCode: number): STATUS => {
  switch (statusCode) {
    case 200:
      return STATUS.OK;
    case 201:
      return STATUS.CREATED;
    case 202:
      return STATUS.ACCEPTED;
    case 204:
      return STATUS.NO_CONTENT;
    case 400:
      return STATUS.BAD_REQUEST;
    case 401:
      return STATUS.UNAUTHORIZED;
    case 403:
      return STATUS.FORBIDDEN;
    case 404:
      return STATUS.NOT_FOUND;
    case 409:
      return STATUS.CONFLICT;
    case 500:
      return STATUS.INTERNAL_SERVER_ERROR;
    case 503:
      return STATUS.SERVICE_UNAVAILABLE;
    default:
      throw new Error('Invalid status code');
  }
};

export class ApiResponse<T> {
  code: number;
  status: STATUS;
  message: string;
  errors: string | null;
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.status = getStatus(code);
    this.errors = null;
    this.message = message;
    this.data = data;
  }

  clone(): ApiResponse<T> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export class ApiResponsePagination<T> {
  code: number;
  status: STATUS;
  message: string;
  errors: string | null;
  data: T;
  page: number;
  limit: number;
  total: number;
  total_pages: number;

  constructor(
    code: number,
    message: string,
    data: T,
    total: number,
    limit: number,
    page: number,
    total_pages: number,
  ) {
    this.code = code;
    this.status = getStatus(code);
    this.errors = null;
    this.message = message;
    this.data = data;
    this.limit = limit;
    this.total = total;
    this.page = page;
    this.total_pages = total_pages;
  }

  clone(): ApiResponsePagination<T> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export const MyResponse = <T>(code: number, message: string, data: T) => {
  return new ApiResponse<T>(code, message, data);
};
