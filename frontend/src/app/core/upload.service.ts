import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share} from 'rxjs/operators';

import * as _ from 'lodash';

/**
 * If params contains 'clientid' the reuest is saved
 * Use this for example to abort the request on the client side
 */
@Injectable({
  "providedIn": "root"
})
export class UploadService {

  public progress$: Observable < any > ;
  private progressObserver: any;

  public ongoingRequests: any = {};

  constructor() {
    this.progress$ = Observable.create(observer => {
      this.progressObserver = observer;
    }).pipe(share());
  }

  makeFileRequest(url: string, params: any, file: File, token: string): Observable < any > {
    return Observable.create(observer => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();

      if (params.clientid) {
        this.ongoingRequests[params.clientid] = xhr;
      }

      /*for (let i = 0; i < files.length; i++) {
      // TODO: multiple files
        formData.append("uploads[]", files[i], files[i].name);
      }*/
      let formData: FormData = new FormData();
      formData.append('uploads[]', file, file.name);
      _.each(params, function(val, key) {
        formData.append(key, val);
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {

            // SUCCESS
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {

            // ERROR
            observer.error({
              error: xhr.response,
              clientid: params.clientid
            });
          }

          // remove request
          if (params.clientid && this.ongoingRequests[params.clientid]) {
            delete this.ongoingRequests[params.clientid];
          }
        }
      };

      // PROGRESS
      xhr.upload.onprogress = (event) => {
        if (this.progressObserver) {
          this.progressObserver.next(
            {
              progress: Math.round(event.loaded / event.total * 100),
              clientid: params.clientid
            }
          );
        }
      };

      // SEND
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', token);
      xhr.send(formData);
    });
  }
}
