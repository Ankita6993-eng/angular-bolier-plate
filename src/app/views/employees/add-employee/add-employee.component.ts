import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AbstractControl} from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {

addemp:FormGroup;
eml_pat = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
submitted=false;

  constructor( public formBuilder: FormBuilder) {
    this.addemp=this.formBuilder.group({
      firstname:['',[Validators.required]],
      lastname:['',[Validators.required]],
      email:['',[Validators.required,Validators.email,Validators.pattern(this.eml_pat)]],
      password:['',[Validators.compose([Validators.required,Validators.minLength(6)])]],
      con_password:['',Validators.required]
    },
    {
         Validators:this.mustMatch('password','con_password')
    }
    );
   }

   mustMatch(pwd:string,con_pwd:string)
   {
      return (formgroup:FormGroup)=>{
        let pwd_match = formgroup.controls[pwd];
        let con_pwd_match = formgroup.controls[con_pwd];

        console.log("con password",con_pwd_match)
        if(pwd_match.errors && !con_pwd_match.errors.mustMatch)
        {
          return;
        }
        if(pwd_match.value !== con_pwd_match.value)
        {
          con_pwd_match.setErrors({ mustMatch: true });
          console.log("Confirm password ",this.f.con_password?.errors)
        }
        else
        {
          con_pwd_match.setErrors(null);
        }
        console.log("Confirm password ",this.f.con_password?.errors)
      }

   }

   get f() { return this.addemp.controls; }

  ngOnInit(): void {
  }
  submit()
  {
    this.submitted=true
    console.log("Addemployees :",this.addemp  )
  }

}
