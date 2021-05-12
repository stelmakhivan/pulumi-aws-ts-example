import * as aws from '@pulumi/aws';

export const studentsTable = new aws.dynamodb.Table('students-table', {
  attributes: [
    {
      name: 'id',
      type: 'S',
    },
  ],
  hashKey: 'id',
  readCapacity: 20,
  tags: {
    Environment: 'production',
    Name: 'dynamodb-table-1',
  },
  ttl: {
    attributeName: 'TimeToExist',
    enabled: true,
  },
  writeCapacity: 20,
});

