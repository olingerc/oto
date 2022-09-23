
import { catchError } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { Observable } from "rxjs";

import { HttpHandler } from "../../core/http-handler";
import { EnvService } from "../../core/env/env.service";

@Injectable()
export class BioinfHttpService {

  private apiBase: string;

  constructor(
    private http: HttpClient,
    private httpHandler: HttpHandler,
    private env: EnvService
  ) {
    this.apiBase = this.env.backendUrl;
  }

  /*
   * Url routes are to task_server, node proxies it if it sees tasksapi
   */

  login(request: any): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/login`, {request}, this.jwt());
  }

  deleteTaskgroup(taskgroupId: string): Observable<any> {
    const request = {
      taskgroupid: taskgroupId
    };
    return this.http.post(`${this.apiBase}/tasksapi/delete_taskgroup`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startSystemBatchChain(requests: any[]): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/start_chain_system`, {requests}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startBatch(request: any, specialDataHandling: any): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/launch_batch`, {request, "special_data_handling": specialDataHandling}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deletePipeline(pipelineid: string): Observable<any> {
    const request = {
      pipelineid: pipelineid
    };
    return this.http.post(`${this.apiBase}/tasksapi/delete_pipeline`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteBatch(batchId: string): Observable<any> {
    const request = {
      batchId
    };
    return this.http.post(`${this.apiBase}/tasksapi/delete_batch`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  fetchTaskgroupConfigArgs(tgname: string): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/taskgroupconfig/${tgname}`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  fetchPipelineConfigArgs(plname: string): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/pipelineconfig/pipelines/${plname}`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  fetchTaskgroup(tgid: string): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/taskgroup/${tgid}, this.jwt()`).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  relinkPipelines(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/pipeline/relink_all`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startRunArchives(runids: string[]): Observable<any> {
    const request = {runids};
    return this.http.post(`${this.apiBase}/tasksapi/archive_runs`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startRunUnarchive(runid: string): Observable<any> {
    const request = {runid};
    return this.http.post(`${this.apiBase}/tasksapi/unarchive_run`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startRunDeleteFromArchive(runid: string): Observable<any> {
    const request = {runid};
    return this.http.post(`${this.apiBase}/tasksapi/removearchive_run`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startRunDeleteFromUnarchive(runid: string): Observable<any> {
    const request = {runid};
    return this.http.post(`${this.apiBase}/tasksapi/removeunarchived_run`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  
  startRunConsistencyCheck(runids: string[]): Observable<any> {
    const request = {runids};
    return this.http.post(`${this.apiBase}/tasksapi/check_runs`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  startArchiveClearStatus(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/archiving_clear_db`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  exportPipelineData(pipelineid, what, action): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/pipeline/exportdata`, {pipelineid, what, action}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  exportReads(runid): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/pipeline/exportreads`, {runid}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  cancelExport(pipelineid): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/pipeline/cancelexport`, {pipelineid}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  reparseRun(runId: string): Observable<any> {
    const request = {runid: runId};
    return this.http.post(`${this.apiBase}/tasksapi/ngssync/reparserun`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  renameRunExperiment(runId: string, new_experiment_name: string): Observable<any> {
    const request = {runid: runId, new_experiment_name};
    return this.http.post(`${this.apiBase}/tasksapi/ngssync/renamerunexperiment`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  /*
   * Url routes to node server
   */
  getPipelines(username: string, groupId: string,
    first: number, rows: number, 
    pipelinesSearchValue: string,
    whosePipelines: string,
    status: string,
    name: string): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("username", username)
      .set("groupId", groupId)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("pipelinesSearchValue", pipelinesSearchValue)
      .set("whosePipelines", whosePipelines)
      .set("status", status)
      .set("name", name)
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/pipelines/list`, options).pipe(
    catchError(res => this.httpHandler.handleError(res)));
  }

  getPipelineAndBatchByObjectId(id: string): Observable<any> {
    return this.http.get(`${this.apiBase}/api/bioinf/pipelines/list/` + id, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getPipelineByPipelineId(pipelineId: string, resultsView: boolean=false): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("resultsView", resultsView.toString())
      ;
    return this.http.get(`${this.apiBase}/api/bioinf/pipelines/list/pipelineid/` + pipelineId, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getJson(path: string, dataRoot: string): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("path", path)
      .set("dataRoot", dataRoot)
      ;
    return this.http.get(`${this.apiBase}/api/bioinf/pipelines/getjson/`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getBatchesAdmin(first: number, rows: number,
                  sortField: string, sortOrder: number,
                  status: string): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
    .set("first", first.toString())
    .set("rows", rows.toString())
    .set("sortField", sortField)
    .set("sortOrder", sortOrder.toString())
    .set("status", status)
    ;

    return this.http.get(`${this.apiBase}/api/bioinf/batches/listadmin`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getUserFiles(): Observable<any> {
    return this.http.get(`${this.apiBase}/api/bioinf/userfiles`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  downloadUserFile(file: any): Observable<any> {
    const options = this.jwt();
    options.responseType = "blob" as "json"; // HACK test !!

    return this.http.get(`${this.apiBase}/api/bioinf/downloaduserfile/${file.path}`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  removeUserFile(clientId): Observable<any> {
    return this.http.delete(`${this.apiBase}/api/bioinf/removefile/` + clientId, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  renameUserFile(clientid: string, newname: string): Observable<any> {
    const body = {clientid, newname};
    return this.http.post(`${this.apiBase}/api/bioinf/renameupload`, body, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getVcfTable(
    vcfJsonPath: string,
    dataRoot: string,
    first: number,
    rows: number,
    multiSortMeta: any,
    sortField: string,
    sortOrder: number,
    filter: any,
    classificationKey: string
  ): Observable<any> {

    const options = this.jwt();
    options.params = new HttpParams()
      .set("path", vcfJsonPath)
      .set("dataRoot", dataRoot)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("multiSortMeta", JSON.stringify(multiSortMeta))
      .set("sortField", sortField)
      .set("sortOrder", sortOrder ? sortOrder.toString() : "")
      .set("filter", JSON.stringify(filter))
      .set("classificationKey", classificationKey);

    return this.http.get(`${this.apiBase}/api/bioinf/vcftable`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getVariants(
    dbPath: string,
    first: number,
    rows: number,
    multiSortMeta: any
  ) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("path", dbPath)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("multiSortMeta", JSON.stringify(multiSortMeta))
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/variants/list`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getBamstatsAll(
    vcfJsonPath: string,
    dataRoot: string,
    first: number,
    rows: number,
    multiSortMeta: any,
    sortField: string,
    sortOrder: number
  ) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("path", vcfJsonPath)
      .set("dataRoot", dataRoot)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("multiSortMeta", JSON.stringify(multiSortMeta))
      .set("sortField", sortField)
      .set("sortOrder", sortOrder ? sortOrder.toString() : "")
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/bamstatsall`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getBamstatsPosition(path: string, position: string) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("path", path)
      .set("position", position)
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/bamstatssingle`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  // Run repo widget
  updateFolderList(machine, search, includeFailed= false, first, rows): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("first", first)
      .set("rows", rows)
      ;

    if (machine) {
      options.params = options.params.set("machine", machine);
    }
    if (search) {
      options.params = options.params.set("search", search);
    }
    if (!includeFailed) {
      options.params = options.params.set("includeFailed", false);
    }

    return this.http.get(`${this.apiBase}/api/luxgen/runsdbserverminimal`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getRunDetails(run: any): Observable<any> {
    return this.http.get(`${this.apiBase}/api/luxgen/rundetailsdb?folder=${run.folder}`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  updateFileList(serverEncodedPath, activeModule): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("serverEncodedPath", serverEncodedPath)
      .set("fileModule", activeModule);

    return this.http.get(`${this.apiBase}/api/luxgen/listfilesrunfolder`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  /* S3 */

  listS3(bucket: string, path: string): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
    .set("bucket", bucket)
    .set("path", path)
    ;

    return this.http.get(`${this.apiBase}/tasksapi/s3list`, options).pipe(
    catchError(res => this.httpHandler.handleError(res)));
  }

  copyToS3(src_root, src_path, src_items, dst_root, dst_path): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/s3copyto`,
      {src_root, src_path, src_items, dst_root, dst_path},
      this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  copyFromS3(src_root, src_path, src_items, dst_root, dst_path): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/s3copyfrom`,
      {src_root, src_path, src_items, dst_root, dst_path},
      this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteFromS3(src_root, src_path, src_items): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/s3delete`,
      {src_root, src_path, src_items},
      this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  archiveDeleteS3(path: string): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/archiving_s3delete`, {path}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  /*

  NIRVANA

  */
  getNirvanaVariants(
    elastic_index: string,
    elastic_index_genes: string,
    first: number,
    rows: number,
    sortOnPosition: boolean,
    filterOnFlags: string[],
    filters: any,
    samples: string[],
    classifications: string[]
  ) {
    const request = {
      elastic_index,
      elastic_index_genes,
      first, rows,
      filters: filters,
      sortOnPosition,
      filterOnFlags,
      samples,
      classifications
    };

    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/list`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getFilters(application: string) {
    const options = this.jwt();
    options.params = new HttpParams()
    .set("application", application)
    ;

    return this.http.get(`${this.apiBase}/api/bioinf/nirvana/filters`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getFilterSets(application: string) {
    const options = this.jwt();
    options.params = new HttpParams()
    .set("application", application)
    ;

    return this.http.get(`${this.apiBase}/api/bioinf/nirvana/filtersets`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  saveOrUpdateFilterSet(filterSet): Observable<any> {
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/savefilterset`, filterSet, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteFilterSet(filterSetId: string): Observable<any> {
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/deletefilterset`, {"_id": filterSetId}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getGenePanels() {
    const options = this.jwt();
    return this.http.get(`${this.apiBase}/api/bioinf/genepanels/list`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  saveOrUpdateGenePanel(panel): Observable<any> {
    return this.http.post(`${this.apiBase}/api/bioinf/genepanels/save`, panel, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteGenePanel(panelId: string): Observable<any> {
    return this.http.post(`${this.apiBase}/api/bioinf/genepanels/delete`, {"_id": panelId}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }
    
  getNirvanaGenes(
    elastic_index: string,
    first: number,
    rows: number,
    searchGene: string,
    elastic_index_coverages: string
  ) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("elastic_index", elastic_index)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("searchGene", searchGene)
      .set("elastic_index_coverages", elastic_index_coverages)
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/nirvana/genes`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNotNirvanaGenes(
    elastic_index: string,
    first: number,
    rows: number,
    searchGene: string,
    elastic_index_coverages: string
  ) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("elastic_index", elastic_index)
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("searchGene", searchGene)
      .set("elastic_index_coverages", elastic_index_coverages)
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/nirvana/genesnotnirvana`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNirvanaGenesSpecific(
    elastic_index: string,
    first: number,
    rows: number,
    genes: string[],
    elastic_index_coverages: string
  ) {
    const request = {elastic_index, genes, elastic_index_coverages, rows, first}

    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/genesspecific`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNotNirvanaGenesSpecific(
    elastic_index: string,
    first: number,
    rows: number,
    genes: string[],
    elastic_index_coverages: string
  ) {
    const request = {elastic_index, genes, elastic_index_coverages, rows, first}

    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/genesspecificnotnirvana`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNirvanaGenesByPhenotypes(
    elastic_index: string,
    first: number,
    rows: number,
    terms: string[],
    andOr: string,
    elastic_index_coverages: string,
    genes_limit: number
  ) {
    const request = { elastic_index, terms, andOr, elastic_index_coverages, genes_limit, first, rows }
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/genesbyphenotypes`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNirvanaGenesByHpoTerms(
    elastic_index: string,
    first: number,
    rows: number,
    terms: string[],
    andOr,
    elastic_index_coverages: string,
    genes_limit: number
  ) {
    const request = { elastic_index, terms, andOr, elastic_index_coverages, genes_limit, first, rows }
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/genesbyhpoterms`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getNotNirvanaGenesByHpoTerms(
    elastic_index: string,
    first: number,
    rows: number,
    terms: string[],
    andOr,
    elastic_index_coverages: string,
    genes_limit: number
  ) {
    const request = { elastic_index, terms, andOr, elastic_index_coverages, genes_limit, first, rows }
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/genesbyhpotermsnotnirvana`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  setVariantFlag(elastic_id: string, variant_index: number, elastic_index: string, activeFilterSet: any, flag: string) {
    const request = { elastic_id, variant_index, elastic_index, "active_filterset": activeFilterSet, flag }
    return this.http.post(`${this.apiBase}/api/bioinf/nirvana/setvariantflag`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  nirvanaGetFlagCount(elastic_index: string) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("elastic_index", elastic_index)
      ;

    return this.http.get(`${this.apiBase}/api/bioinf/nirvana/getflagcount`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  /*

  VARIANT DB TODO: new service

  */

  importGenesData(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/importgenesdata`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  createVariantDb(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/createdb`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getVariantDb(
    first: number,
    rows: number,
    classifications: string[],
    search: string,
    searchType: string) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("first", first.toString())
      .set("rows", rows.toString())
      .set("searchType", searchType)
      ;
    
    if (search && search !== "") {
      options.params = options.params.set("search", search);
    }

    if (classifications && classifications.length > 0) {
      options.params = options.params.set("classifications", JSON.stringify(classifications));
    }

    return this.http.get(`${this.apiBase}/api/bioinf/vdb/list`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getHpoTerms(query) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("query", query)
      ;
    return this.http.get(`${this.apiBase}/api/bioinf/genes/hpo`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbGetVids(vids: string[]) {
    const request = { vids };

    return this.http.post(`${this.apiBase}/api/bioinf/vdb/getvids`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbAddComment(vid: string, comment: string, filterSet: any, context: string) {
    const request = { vid, comment, filterSet, context };

    return this.http.post(`${this.apiBase}/api/bioinf/vdb/addcomment`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbUpdateComment(commentId: string, commentText: string) {
    const request = { commentId, commentText };

    return this.http.post(`${this.apiBase}/api/bioinf/vdb/updatecomment`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbDeleteComment(commentId: string) {
    return this.http.delete(`${this.apiBase}/api/bioinf/vdb/deletecomment/` + commentId, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbUpdateClassification(vid: string, classification: string, filterSet: any, context: string) {
    const request = { vid, classification, filterSet, context };

    return this.http.post(`${this.apiBase}/api/bioinf/vdb/updateclassification`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbGetContextTotals() {
    return this.http.get(`${this.apiBase}/api/bioinf/vdb/contexttotals`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  vdbGetOverlap(pipelineId: string, application: string) {
    const options = this.jwt();
    options.params = new HttpParams()
      .set("pipelineId", pipelineId)
      .set("application", application)
      ;
    return this.http.get(`${this.apiBase}/api/bioinf/vdb/getoverlap`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers;
    if (currentUser && currentUser.token) {
      headers = new HttpHeaders().set('Authorization', currentUser.token);
    } else {
      headers = new HttpHeaders().set('Authorization', '');
    }
    let requestOptions = {
      headers: headers,
      responseType: 'json' as 'json',
      params: new HttpParams()
    };
    return requestOptions;
  }
}
