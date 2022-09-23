/*
http://stackoverflow.com/questions/18095727/how-can-i-limit-the-length-of-a-string-that-displays-with-when-using-angularj
Usage:

{{some_text | truncate:true:100:" ..."}}

Options:

wordwise (boolean) - if true, cut only by words bounds,
max (integer) - max length of the text, cut to this number of chars,
tail (string, default: " …") - add this string to the input string if the string was cut.
*/

import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
    name: "myTruncate",
    pure: false
})
@Injectable()
export class MyTruncatePipe implements PipeTransform {
    transform(value: string, wordwise: boolean, max: any, tail: string): string {
      if (!value) {
        return "";
      }

      max = parseInt(max, 10);
      if (!max) {
        return value;
      }
      if (value.length <= max) {
        return value;
      }

      value = value.substr(0, max);
      if (wordwise) {
        const lastspace = value.lastIndexOf(" ");
        if (lastspace !== -1) {
          value = value.substr(0, lastspace);
        }
      }
      return value + (tail || " …");
    }
}
