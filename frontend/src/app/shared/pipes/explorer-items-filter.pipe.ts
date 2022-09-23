import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'myExplorerItemsFilter',
    pure: false
})
@Injectable()
export class MyExplorerItemsFilterPipe implements PipeTransform {
    transform(items: any[], category: string): any {
      // filter items array, items which match and return true will be kept, false will be filtered out
      return items.filter(item => item.type === category);
    }
}
