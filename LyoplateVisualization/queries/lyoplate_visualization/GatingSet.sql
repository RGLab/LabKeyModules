SELECT
 gsid               AS Id,
 gsname             AS Name,
 gspath             AS Path,
 gsdescription      AS Description,
 container.EntityId AS EntityId,
 created            AS Created
FROM
 gstbl
