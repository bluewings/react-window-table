/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import faker from 'faker';

const generate = (index) => ({
  // id: index,
  avatar: faker.image.avatar(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  city: faker.address.city(),
  email: faker.internet.email(),
  street: faker.address.streetName(),
  zipCode: faker.address.zipCode(),
  date: faker.date.past(),
  bs: faker.company.bs(),
  catchPhrase: faker.company.catchPhrase(),
  companyName: faker.company.companyName(),
  words: faker.lorem.words(),
  sentence: faker.lorem.sentence(),
});

const columnDef = {
  id: {
    width: 50,
  },
  avatar: {
    width: 50,
    header: (data) => {
      return <strong>{data}</strong>;
    },
    render: (src) => (
      <span>
        <img src={src} height={50} alt="avatar" />
      </span>
    ),
  },
};

const getFakeData = (size = 1000) => {
  const rows = new Array(size).fill(true).map((e, i) => generate(i));
  const columns = Object.keys(rows[0]).map((name) => {
    if (columnDef[name]) {
      return { name, ...columnDef[name] };
    }
    return name;
  });
  return { columns, rows };
};

const fakeUsers = getFakeData();

const { columns, rows } = fakeUsers;

export default fakeUsers;

export { columns, rows, getFakeData };
