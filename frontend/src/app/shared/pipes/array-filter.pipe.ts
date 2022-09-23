import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'myArrayFilter',
    pure: false
})
@Injectable()
export class MyArrayFilterPipe implements PipeTransform {
    transform(array: any[], value: any): any {
      // filter items array, items which match and return true will be kept, false will be filtered out
      return array.filter(item => item === value);
    }
}
