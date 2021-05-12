import * as awsx from '@pulumi/awsx';

import { getStudent, saveStudent, updateStudent, deleteStudent } from '../lambdas'

export const endpoint = new awsx.apigateway.API('api', {
  routes: [
    {
      path: '/{id}',
      method: 'GET',
      eventHandler: getStudent,
    },
    {
      path: '/',
      method: 'PUT',
      eventHandler: saveStudent,
    },
    {
      path: '/{id}',
      method: 'PATCH',
      eventHandler: updateStudent,
    }, {
      path: '/{id}',
      method: 'DELETE',
      eventHandler: deleteStudent,
    },
  ],
});
