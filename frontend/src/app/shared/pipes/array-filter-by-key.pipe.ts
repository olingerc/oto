import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'myArrayFilterByKey',
    pure: false,
    standalone: true
})
@Injectable()
export class MyArrayFilterByKeyPipe implements PipeTransform {
    transform(array: any[], value: any, key: any): any {
      // filter items array, items which match and return true will be kept, false will be filtered out
      return array.filter(item => {
        return item[key] && item[key] === value;
      });
    }
}
