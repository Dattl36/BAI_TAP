import { axiosClient, request } from "./axiosClient";
import type { EntityId, ListResponse, QueryParams } from "../types/common";
import type { SalonService } from "../types/service";
import type { Employee } from "../types/employee";
import type { Promotion } from "../types/promotion";

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  published_at: string;
  image_url: string;
  category: string;
  read_time: string;
}

export const publicApi = {
  getServices(params?: QueryParams) {
    return request<ListResponse<SalonService>>(axiosClient.get("/api/public/services/", { params }));
  },
  getServiceDetail(id: EntityId) {
    return request<SalonService>(axiosClient.get(`/api/public/services/${id}/`));
  },
  getStylists(params?: QueryParams) {
    return request<ListResponse<Employee>>(axiosClient.get("/api/public/stylists/", { params }));
  },
  getPromotions(params?: QueryParams) {
    return request<ListResponse<Promotion>>(axiosClient.get("/api/public/promotions/", { params }));
  },
  getArticles(params?: QueryParams) {
    return request<ListResponse<Article>>(axiosClient.get("/api/public/articles/", { params }));
  },
};
