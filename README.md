# Lyncat Client

Updater automático de lyncat.

Instalación:

*npm install -g lyncat*

## ¿Como funciona?

El proceso que hace el updater es el siguiente:

1) Se conecta a corus usando el user "admin" (tras solicita host y password)

2) Recupera de Corus los siguientes elementos:

    - Configuración de la App
    - Lista de Scripts
    - Lista de collcoColecciones

3) Para cada item comprobamos si lo que hay en Corus es diferente del JSON que consta en el updater.
   Si es igual no hacemos nada (mostramos por pantalla que el archivo ya está actualizado).
   Si es diferente:

    - Si el campo modifiedBy es "admin": El archivo no está actualizado. Informamos al usuario y le damos
      opción de actualizarlo (S/N).

    - Si el campo modifiedBy no es "admin": El archivo ha sido modificado manualmente. Informamos al usuario
      que el archivo se debe actualizar a mano.

4) Mostramos al usuario el resumen final:

    - Archivos que se actualizarán (hemos indicado SI a actualizar)
    - Archivos que NO se actualizarán (hemos indicado NO a actualizar)
    - Archivos que no se pueden actualizar (se han modificado manualmente)

5) El usuario Acepta o Rechaza: Si Acepta se aplicarán los cambios, si no NO.
   En caso de aceptar los cambios se guardará una copia del estado actual en Corus (para poder hacer Rollback)


### Actualización de app:

* fields.json:

  Array de campos de aplicación con los que se reemplazarán los campos existentes.
  Si el array está vacío (o el fichero no existe) no se hará nada.

* data.json:

  Contiene los campos del "data" de la app que hay que actualizar en esta versión.
  Como mínimo siempre debería incluir el campo version (que se actualiza en cada nueva versión).



