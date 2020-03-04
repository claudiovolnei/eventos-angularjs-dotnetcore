import { Component, OnInit } from '@angular/core';
import { EventoService } from 'src/app/_services/evento.service';
import {  BsLocaleService } from 'ngx-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { retry } from 'rxjs/operators';
import { Evento } from 'src/app/_models/Evento';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evento-edit',
  templateUrl: './eventoEdit.component.html',
  styleUrls: ['./eventoEdit.component.css']
})
export class EventoEditComponent implements OnInit {

titulo = 'Editar Evento';
evento: Evento = new Evento();
registerForm: FormGroup;
imagemURL = 'assets/img/Download.png';
fileNameToUpdate: string;
dataAtual: string;
file: File;

get lotes(): FormArray {
  return this.registerForm.get('lotes') as FormArray;
}
get redeSociais(): FormArray {
  return this.registerForm.get('redeSociais') as FormArray;
}

constructor(
   private eventoService: EventoService
,  private fb: FormBuilder
,  private localeService: BsLocaleService
,  private toastr: ToastrService
,  private router: ActivatedRoute
 ) {
   this.localeService.use('pt-Br');
 }

 ngOnInit() {
  this.validation();
  this.carregarEvento();
}

carregarEvento() {
  const idEvento = +this.router.snapshot.paramMap.get('id');
  this.eventoService.getEventoById(idEvento)
    .subscribe(
      (evento: Evento) => {
        this.evento = Object.assign({}, evento);
        this.fileNameToUpdate = evento.imagemURL.toString();

        this.imagemURL = `http://localhost:5000/resources/images/${this.evento.imagemURL}?_ts=${this.dataAtual}`;
        this.evento.imagemURL = '';
        this.registerForm.patchValue(this.evento);

        this.evento.lotes.forEach(lote => {
          this.lotes.push(this.criaLote(lote));
        });
        this.evento.redeSociais.forEach(redeSocial => {
          this.redeSociais.push(this.criaRedeSocial(redeSocial));
        });
      }
  );
}

validation() {
  this.registerForm = this.fb.group({
    id: [],
    tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    local: ['', Validators.required],
    dataEvento: ['', Validators.required],
    qtdPessoas: ['',
        [Validators.required, Validators.max(120000)]],
    imagemURL: [''],
    telefone: ['', Validators.required],
    email: ['',
    [Validators.required, Validators.email]],
    lotes: this.fb.array([]),
    redeSociais: this.fb.array([]),
  });
}

criaLote(lote: any): FormGroup {
  return this.fb.group({
    id: [lote.id],
    nome: [lote.nome, Validators.required],
    quantidade : [lote.quantidade, Validators.required],
    preco: [lote.preco, Validators.required],
    dataInicio: [lote.dataInicio, ],
    dataFim: [lote.dataFim, ]
  });
}

criaRedeSocial(redeSocial: any): FormGroup {
  return this.fb.group({
    id: [redeSocial.id],
    nome: [redeSocial.nome, Validators.required],
    url : [redeSocial.url, Validators.required]
  });
}

adicionarLote() {
  this.lotes.push(this.criaLote({ id: 0}));
}

removerLote(id: number) {
  this.lotes.removeAt(id);
}

removerRedeSocial(id: number) {
  this.redeSociais.removeAt(id);
}

adicionarRedeSocial() {
  this.redeSociais.push(this.criaRedeSocial({ id: 0}));
}

onFileChange(file: FileList) {
  const reader = new FileReader();
  reader.onload = (event: any) => this.imagemURL = event.target.result;

  // tslint:disable-next-line: deprecation
  reader.readAsDataURL(file[0]);

}

salvarEvento() {
  this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
  this.evento.imagemURL = this.fileNameToUpdate;
  this.uploadImagem();

  this.eventoService.putEvento(this.evento).subscribe(
    () => {
      this.toastr.success('Editado com sucesso!');
    }, error => {
      this.toastr.error(' Erro ao editar: ${error}');
    }
  );
}
uploadImagem() {
  if (this.registerForm.get('imagemURL').value !== '') {
    this.eventoService.postUpload(this.file, this.fileNameToUpdate).subscribe(
      () => {
        this.dataAtual = new Date().getDate().toString();
        this.imagemURL = `http://localhost:5000/resources/images/${this.evento.imagemURL}?_ts=${this.dataAtual}`;
       }
   );
  }
}

}
