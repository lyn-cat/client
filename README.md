# Lyncat Client

Updater automático de lyncat. El proceso es el siguiente:

1) Nos conectamos a corus usando el user "admin".

2) Recuperamos de Corus:

    - App
    - Scripts
    - Colecciones

3) Para cada item comprobamos si lo que hay en Corus es diferente del JSON que consta en el updater.
   Si es igual no hacemos nada (mostramos por pantalla que el archivo ya está actualizado).
   Si es diferente:

    - Si el campo modifiedBy es "admin": El archivo no está actualizado. Informamos al usuario y le damos
      opción de actualizarlo (S/N).

    - Si el campo modifiedBy no es "admin": El archivo ha sido modificado manualmente. Informamos al usuario
      que el item se debe actualizar a mano.

4) Mostramos al usuario el resumen final:

    - Archivos que se actualizarán (hemos indicado SI a actualizar)
    - Archivos que NO se actualizarán (hemos indicado NO a actualizar)
    - Archivos que no se pueden actualizar (se han modificado manualmente)

5) El usuario Acepta o Rechaza: Si Acepta se aplicarán los cambios, si no NO.
   En caso de aceptar los cambios se guardará una copia del estado actual en Corus (para poder hacer Rollback)


## Actualización de app:





