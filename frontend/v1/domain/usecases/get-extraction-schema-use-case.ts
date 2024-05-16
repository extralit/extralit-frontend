import { type NuxtAxiosInstance } from "@nuxtjs/axios";

import { Data, DataFrame, ReferenceValues, PanderaSchema, SchemaMetadata } from "@/components/base/base-render-table/types";

const FILES_API_ERRORS = {
  ERROR_FETCHING_SCHEMA_FILE: "ERROR_FETCHING_SCHEMA_FILE",
};

export class GetExtractionSchemaUseCase {
  constructor(
    private readonly axios: NuxtAxiosInstance,
  ) {}

  async fetch(
    workspaceName: string,
    schemaName: string, 
    versionId?: string,
  ): Promise<[PanderaSchema, SchemaMetadata]> {

    try {
      const url = `/v1/file/${workspaceName}/schemas/${schemaName.toLocaleLowerCase()}.json`;
      const response = await this.axios.get<PanderaSchema>(url, {
        params: {
          version_id: versionId,
        }
      });
      const headers = response.headers;
      const schema = response.data;

      const SchemaMetadata: SchemaMetadata = {
        schemaName: schemaName,
        etag: headers.get('etag'),
        version_id: headers.get('version-id'),
        version_tag: headers.get('version-tag'),
        last_modified: new Date(new Date(headers.get('last-modified') || '').toISOString()),
      };

      return [schema, SchemaMetadata];
    } catch (error) {
      let errorMessage = error.message;
      if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data) {
        errorMessage = error.response.data;
      } else if (error.response) {
        errorMessage = error.response;
      }

      throw {
        response: FILES_API_ERRORS.ERROR_FETCHING_SCHEMA_FILE,
        message: errorMessage
      }
    }
  }

}
