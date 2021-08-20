import React from "react";
import { Card, Container } from "@material-ui/core";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextFieldValidate } from "../components/TextFieldValidate";

export function SearchPage() {
  return (
    <Container>
      <Formik
        initialValues={{ searchTerm: "" }}
        onSubmit={() => undefined}
        validationSchema={Yup.object({
          searchTerm: Yup.string()
            .required(`You can't search for nothingness`)
            .max(100),
        })}
      >
        <Card>
          <TextFieldValidate
            label="Search for anything"
            fullWidth
            InputProps={{ fullWidth: true }}
            autoFocus
            name="searchTerm"
          />
        </Card>
      </Formik>
    </Container>
  );
}
