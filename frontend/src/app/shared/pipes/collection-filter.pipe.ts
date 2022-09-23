import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'myCollectionFilter',
    pure: false
})
@Injectable()
export class MyCollectionFilterPipe implements PipeTransform {
    transform(collection: any[], property: string, value: any): any {
      // filter items array, items which match and return true will be kept, false will be filtered out
      if (!collection) {
        return [];
      }
      return collection.filter(item => item[property] === value);
    }
}
